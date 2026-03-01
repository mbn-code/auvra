import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.stripe_session_id) {
      return NextResponse.json({ error: "Stripe Session ID missing" }, { status: 400 });
    }

    // Get the payment intent from the session
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment Intent not found" }, { status: 400 });
    }

    // Issue the refund
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Update status in Supabase
    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId);

    // Restore inventory on refund.
    // - Regular archive items (is_stable=false): were marked 'sold' on purchase → restore to 'available'
    // - Stable items (is_stable=true): stock_level was decremented on purchase → increment it back
    if (order.product_id) {
      const { data: item, error: itemError } = await supabase
        .from('pulse_inventory')
        .select('id, is_stable, stock_level')
        .eq('id', order.product_id)
        .maybeSingle();

      if (itemError) {
        console.error('[Refund] Failed to fetch inventory item:', itemError.message);
      } else if (item) {
        if (item.is_stable) {
          // Restore one unit of stock
          const { error: stockErr } = await supabase
            .from('pulse_inventory')
            .update({ stock_level: (item.stock_level ?? 0) + 1 })
            .eq('id', order.product_id);
          if (stockErr) {
            console.error('[Refund] Failed to restore stable stock:', stockErr.message);
          }
        } else {
          // Return the one-of-a-kind item to available
          const { error: statusErr } = await supabase
            .from('pulse_inventory')
            .update({ status: 'available' })
            .eq('id', order.product_id);
          if (statusErr) {
            console.error('[Refund] Failed to restore inventory status:', statusErr.message);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Refund Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
