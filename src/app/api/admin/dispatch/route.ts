import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDispatchEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { orderId, trackingNumber } = await req.json();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, pulse_inventory(title)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send email via Resend
    await sendDispatchEmail(order.customer_email, {
      productName: order.pulse_inventory?.title || "Archive Piece",
      trackingNumber: trackingNumber
    });

    // Update status in Supabase
    await supabase
      .from('orders')
      .update({ status: 'dispatched', tracking_number: trackingNumber })
      .eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
