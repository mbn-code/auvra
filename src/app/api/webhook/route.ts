import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { products } from "@/config/products";
import { sendOrderEmail, sendSocietyActiveEmail } from "@/lib/email";
import { sendSecureNotification } from "@/lib/notifications";

// ─────────────────────────────────────────────────────────────────────────────
// Stripe subscription statuses that mean "no longer paying"
// ─────────────────────────────────────────────────────────────────────────────
const INACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: downgrade a profile to free tier by Stripe customer ID.
// Called by both subscription.updated (when status goes inactive) and
// subscription.deleted (always).
// ─────────────────────────────────────────────────────────────────────────────
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

  if (!profile) {
    // Customer ID not yet stored — possible for old subscriptions created
    // before this fix was deployed. Log and continue; no action needed.
    console.warn(
      `[Webhook] No profile found for Stripe customer ${stripeCustomerId}. Skipping downgrade.`
    );
    return;
  }

  if (profile.membership_tier !== "society") {
    // Already downgraded or was never upgraded — idempotent, no-op.
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
  } else {
    console.log(
      `[Webhook] Society tier revoked for profile ${profile.id} (Stripe customer: ${stripeCustomerId}, status: ${newStatus})`
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: checkout.session.completed
  // Handles: membership upgrades + archive/product purchases
  // ───────────────────────────────────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const { productId, type, userId, sessionId, creativeId, preOrder } =
      session.metadata || {};
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // HANDLE MEMBERSHIP PURCHASE
    if (type === "membership" && userId) {
      try {
        // Persist the Stripe customer ID and subscription ID so future
        // subscription lifecycle events (updated/deleted) can find this profile.
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
      } catch (e) {
        console.error("Failed to upgrade membership:", e);
      }
    }
    // HANDLE PRODUCT PURCHASE
    else if (customerEmail && productId) {
      let productName = "Archive Piece";
      let price = `€${(session.amount_total / 100).toFixed(2)}`;
      let vintedUrl = "";
      let profit = 0;

      // PHASE 2 CIS: Log the purchase event (idempotent via stripe_event_id)
      const safeSessionId = sessionId || "unknown";
      const safeCreativeId = creativeId || null;
      const stripeEventId = event.id;

      const { data: existingEvent } = await supabase
        .from("pulse_events")
        .select("id")
        .eq("event_type", "purchase")
        .contains("metadata", { stripe_event_id: stripeEventId })
        .maybeSingle();

      if (!existingEvent) {
        await supabase.rpc("batch_insert_pulse_events", {
          events: [
            {
              session_id: safeSessionId,
              creative_id: safeCreativeId,
              event_type: "purchase",
              metadata: {
                revenue: session.amount_total / 100,
                stripe_event_id: stripeEventId,
              },
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }

      if (type === "archive") {
        const { data: item } = await supabase
          .from("pulse_inventory")
          .select("*")
          .eq("id", productId)
          .single();

        if (item) {
          productName = item.title;
          vintedUrl = item.source_url;
          profit = item.potential_profit;

          try {
            if (!item.is_stable) {
              const { error } = await supabase
                .from("pulse_inventory")
                .update({ status: "sold" })
                .eq("id", productId);
              if (error) throw error;
            } else {
              // Both operations are atomic RPCs — no read-then-write race condition.
              const { error: stockErr } = await supabase.rpc("decrement_stock", {
                item_id: productId,
              });
              if (stockErr) throw stockErr;
              const { error: countErr } = await supabase.rpc("increment_units_sold", {
                item_id: productId,
              });
              if (countErr) throw countErr;
            }
          } catch (updateErr) {
            console.error(
              `Failed to update inventory for ${productId}:`,
              updateErr
            );
          }
        }
      } else {
        const staticProduct = products[productId];
        if (staticProduct) {
          productName = staticProduct.name;
          vintedUrl = staticProduct.sourceUrl || "";
          profit = (staticProduct.price / 100) - 15;
        }
      }

      const initialStatus =
        preOrder === "true"
          ? "awaiting_manufacturing_allocation"
          : "pending_secure";

      const { error: orderInsertError } = await supabase.from("orders").insert({
        stripe_session_id: session.id,
        product_id: type === "archive" ? productId : null,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: session.customer_details?.address,
        source_url: vintedUrl,
        status: initialStatus,
      });

      if (orderInsertError) {
        // Do NOT return non-200 — Stripe would retry and re-run inventory + emails.
        // Log prominently and fire an alert for manual reconciliation.
        console.error(
          "[Webhook] CRITICAL: orders.insert failed for Stripe session",
          session.id,
          "| customer:", customerEmail,
          "| product:", productId,
          "| error:", orderInsertError.message
        );
        // Reuse the existing notification channel so the alert reaches the operator.
        await sendSecureNotification({
          productName: `ORDER RECORD FAILED — ${productName}`,
          vintedUrl: vintedUrl || "n/a",
          profit: 0,
          customerName: customerName || "Unknown",
          customerAddress: `DB insert error: ${orderInsertError.message} | Stripe session: ${session.id}`,
        }).catch(() => {}); // Swallow notification errors — original error already logged above
      }

      await sendOrderEmail(customerEmail, {
        productName,
        price,
        type: type as any,
      });

      if (vintedUrl) {
        await sendSecureNotification({
          productName,
          vintedUrl,
          profit,
          customerName: customerName || "Customer",
          customerAddress: `${session.customer_details?.address?.line1}, ${session.customer_details?.address?.city}`,
        });
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: customer.subscription.updated
  //
  // Fired whenever a subscription changes state. If it transitions to a
  // terminal non-paying status, revoke the Society tier immediately.
  // ───────────────────────────────────────────────────────────────────────────
  else if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as any;
    const stripeCustomerId = subscription.customer as string;
    const status: string = subscription.status;

    if (INACTIVE_SUBSCRIPTION_STATUSES.has(status)) {
      console.log(
        `[Webhook] Subscription ${subscription.id} updated to '${status}' — revoking Society tier.`
      );
      await revokeSociety(stripeCustomerId, status);
    } else {
      // Subscription is active/trialing — ensure profile is marked active.
      // This handles cases like a payment recovering from past_due.
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: status })
        .eq("stripe_customer_id", stripeCustomerId);

      if (error) {
        console.error("[Webhook] Failed to sync subscription status:", error.message);
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT: customer.subscription.deleted
  //
  // Fired when a subscription is fully cancelled (end of billing period or
  // immediately). Always revoke Society tier — this is the hard termination.
  // ───────────────────────────────────────────────────────────────────────────
  else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    const stripeCustomerId = subscription.customer as string;

    console.log(
      `[Webhook] Subscription ${subscription.id} deleted — revoking Society tier.`
    );
    await revokeSociety(stripeCustomerId, "canceled");
  }

  return NextResponse.json({ received: true });
}
