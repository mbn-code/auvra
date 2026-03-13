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

    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    const paymentIntentId = (order.stripe_payment_intent_id || session.payment_intent) as string;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment Intent not found" }, { status: 400 });
    }

    const { data: relatedOrders, error: relatedOrdersError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', order.stripe_session_id);

    if (relatedOrdersError) {
      throw relatedOrdersError;
    }

    const activeOrders = (relatedOrders || []).filter((entry) => entry.status !== 'refunded');

    if (activeOrders.length === 0) {
      return NextResponse.json({ error: "Order has already been refunded" }, { status: 400 });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return NextResponse.json({
      success: true,
      stripeSessionId: order.stripe_session_id,
      refundId: refund.id,
      status: 'pending_webhook',
    });
  } catch (error: unknown) {
    console.error("Refund Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Refund failed" }, { status: 500 });
  }
}
