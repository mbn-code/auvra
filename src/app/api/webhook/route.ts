import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { products } from "@/config/products";
import { sendOrderEmail, sendSocietyActiveEmail } from "@/lib/email";
import { sendSecureNotification } from "@/lib/notifications";
import { isUuid, parseOrderItemsFromMetadata } from "@/lib/order-items";

const INACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

async function revokeSociety(stripeCustomerId: string, newStatus: string) {
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("id, membership_tier")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (lookupError) {
    console.error("[Webhook] Profile lookup failed:", lookupError.message);
    return;
  }

  if (!profile || profile.membership_tier !== "society") {
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      membership_tier: "free",
      subscription_status: newStatus,
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("[Webhook] Failed to revoke Society tier:", updateError.message);
  }
}

async function upsertWebhookEvent(
  eventId: string,
  eventType: string,
  stripeObjectId: string | null,
  status: "processing" | "processed" | "failed",
  errorMessage?: string | null
) {
  const timestamp = new Date().toISOString();

  await supabase.from("stripe_webhook_events").upsert(
    {
      event_id: eventId,
      event_type: eventType,
      stripe_object_id: stripeObjectId,
      status,
      error_message: errorMessage ?? null,
      processed_at: status === "processed" ? timestamp : null,
      updated_at: timestamp,
    },
    { onConflict: "event_id" }
  );
}

async function reserveWebhookEvent(eventId: string, eventType: string, stripeObjectId: string | null) {
  const { data, error } = await supabase.rpc("reserve_webhook_event", {
    event_id_input: eventId,
    event_type_input: eventType,
    stripe_object_id_input: stripeObjectId,
  });

  return { status: data as string | null, error };
}

async function processMembershipCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerEmail = session.customer_details?.email;

  if (!userId) {
    return;
  }

  const stripeCustomerId = session.customer as string | null;
  const stripeSubscriptionId = session.subscription as string | null;

  await supabase
    .from("profiles")
    .update({
      membership_tier: "society",
      subscription_status: "active",
      ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }),
      ...(stripeSubscriptionId && {
        stripe_subscription_id: stripeSubscriptionId,
      }),
    })
    .eq("id", userId);

  if (customerEmail) {
    await sendSocietyActiveEmail(customerEmail);
  }
}

async function processProductCheckout(eventId: string, session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    return;
  }

  const customerName = session.customer_details?.name;
  const safeSessionId = session.metadata?.sessionId || "unknown";
  const safeCreativeId = session.metadata?.creativeId || null;
  const preOrder = session.metadata?.preOrder === "true";
  const rawCartType = session.metadata?.type;
  const shouldCheckInventory = rawCartType === "archive" || rawCartType === "mixed";
  const cartType: "archive" | "static" = rawCartType === "static" ? "static" : "archive";
  const orderItems = parseOrderItemsFromMetadata(session.metadata);
  const initialStatus = preOrder
    ? "awaiting_manufacturing_allocation"
    : "pending_secure";
  const sourceUrls: string[] = [];
  const amountTotal = session.amount_total ?? 0;
  const stripePaymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : null;

  if (orderItems.length === 0) {
    throw new Error(`Stripe session ${session.id} did not contain any order items`);
  }

  const { error: analyticsError } = await supabase.rpc("batch_insert_pulse_events", {
    events: [
      {
        session_id: safeSessionId,
        creative_id: safeCreativeId,
        event_type: "purchase",
        metadata: {
          revenue: amountTotal / 100,
          stripe_event_id: eventId,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  });

  if (analyticsError) {
    throw analyticsError;
  }

  let firstProductName = "Archive Piece";
  let totalItemCount = 0;

  for (const { id, quantity } of orderItems) {
    let productName = "Archive Piece";
    let vintedUrl = "";
    let profit = 0;

    if (shouldCheckInventory && isUuid(id)) {
      const { data: item, error: itemError } = await supabase
        .from("pulse_inventory")
        .select("id, title, source_url, potential_profit")
        .eq("id", id)
        .single();

      if (itemError) {
        throw itemError;
      }

      productName = item.title;
      vintedUrl = item.source_url;
      profit = item.potential_profit || 0;
    }

    if (!vintedUrl) {
      const staticProduct = products[id];
      if (staticProduct) {
        productName = staticProduct.name;
        vintedUrl = staticProduct.sourceUrl || "";
        profit = (staticProduct.price / 100) - 15;
      }
    }

    if (totalItemCount === 0) {
      firstProductName = productName;
    }

    totalItemCount += quantity;

    if (vintedUrl) {
      sourceUrls.push(vintedUrl);
    }

    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from("orders")
      .upsert(
        {
          stripe_session_id: session.id,
          stripe_payment_intent_id: stripePaymentIntentId,
          product_id: isUuid(id) ? id : null,
          product_sku: id,
          product_name: productName,
          quantity,
          customer_email: customerEmail,
          customer_name: customerName,
          shipping_address: session.customer_details?.address,
          source_url: vintedUrl,
          status: initialStatus,
        },
        { onConflict: "stripe_session_id,product_sku" }
      )
      .select("id")
      .single();

    if (orderInsertError) {
      console.error(
        "[Webhook] orders.insert failed",
        session.id,
        customerEmail,
        id,
        orderInsertError.message
      );
      throw orderInsertError;
    }

    if (shouldCheckInventory && isUuid(id)) {
      const { error: fulfillError } = await supabase.rpc("fulfill_order_item", {
        order_id_input: insertedOrder.id,
        item_id_input: id,
        item_quantity_input: quantity,
      });

      if (fulfillError) {
        throw fulfillError;
      }
    }

    if (vintedUrl) {
      const notificationResult = await sendSecureNotification({
        productName: quantity > 1 ? `${productName} x${quantity}` : productName,
        vintedUrl,
        profit: profit * quantity,
      });

      if (notificationResult !== undefined) {
        await supabase
          .from("orders")
          .update({ admin_notified_at: new Date().toISOString() })
          .eq("id", insertedOrder.id);
      }
    }
  }

  if (totalItemCount > 0) {
    await sendOrderEmail(customerEmail, {
      productName: totalItemCount > 1 ? `${firstProductName} + ${totalItemCount - 1} more` : firstProductName,
      price: `€${(amountTotal / 100).toFixed(2)}`,
      type: cartType,
      stripeSessionId: session.id,
      sourceUrls,
    });

    await supabase
      .from("stripe_webhook_events")
      .update({ customer_notified_at: new Date().toISOString() })
      .eq("event_id", eventId);
  }
}

async function processRefund(refund: Stripe.Refund) {
  const paymentIntentId = typeof refund.payment_intent === "string"
    ? refund.payment_intent
    : refund.payment_intent?.id;

  if (!paymentIntentId) {
    throw new Error(`Refund ${refund.id} is missing payment_intent`);
  }

  const { data: order, error: orderLookupError } = await supabase
    .from("orders")
    .select("stripe_session_id, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .neq("status", "refunded")
    .limit(1)
    .maybeSingle();

  if (orderLookupError) {
    throw orderLookupError;
  }

  if (!order?.stripe_session_id) {
    return;
  }

  const { error: refundError } = await supabase.rpc("refund_order_session", {
    stripe_session_id_input: order.stripe_session_id,
    refund_id_input: refund.id,
    refunded_at_input: new Date((refund.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
  });

  if (refundError) {
    throw refundError;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown webhook signature error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const stripeObjectId = (event.data.object as { id?: string }).id ?? null;
  const { data: existingWebhookEvent } = await supabase
    .from("stripe_webhook_events")
    .select("status")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingWebhookEvent?.status === "processed") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const reservation = await reserveWebhookEvent(event.id, event.type, stripeObjectId);
  if (reservation.error) {
    console.error("[Webhook] Failed to reserve event:", reservation.error.message);
    return NextResponse.json({ error: "Webhook reservation failed" }, { status: 500 });
  }

  if (reservation.status === "processed" || reservation.status === "in_progress") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === "membership") {
        await processMembershipCheckout(session);
      } else {
        await processProductCheckout(event.id, session);
      }
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      const status: string = subscription.status;

      if (INACTIVE_SUBSCRIPTION_STATUSES.has(status)) {
        await revokeSociety(stripeCustomerId, status);
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_status: status })
          .eq("stripe_customer_id", stripeCustomerId);

        if (error) {
          console.error("[Webhook] Failed to sync subscription status:", error.message);
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      await revokeSociety(stripeCustomerId, "canceled");
    } else if (event.type === "refund.created") {
      const refund = event.data.object as Stripe.Refund;
      await processRefund(refund);
    }

    await upsertWebhookEvent(event.id, event.type, stripeObjectId, "processed");
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("[Webhook] Processing failure:", error);
    await upsertWebhookEvent(
      event.id,
      event.type,
      stripeObjectId,
      "failed",
      error instanceof Error ? error.message : "Unknown webhook error"
    );
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
