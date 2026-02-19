import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
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

    // If it's an archive piece, we should probably mark it as sold or archived in inventory too
    if (order.product_id) {
      await supabase
        .from('pulse_inventory')
        .update({ status: 'archived' })
        .eq('id', order.product_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Refund Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
