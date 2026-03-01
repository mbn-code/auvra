import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { sendDispatchEmail } from "@/lib/email";
import { verifyAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Update DB first. If this fails, return an error to the admin UI
    // and do NOT send the customer email — preventing a dispatch notification
    // for an order whose status was never actually updated.
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'dispatched', tracking_number: trackingNumber })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Dispatch] DB update failed for order', orderId, ':', updateError.message);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // DB committed — now safe to notify the customer.
    await sendDispatchEmail(order.customer_email, {
      productName: order.pulse_inventory?.title || "Archive Piece",
      trackingNumber: trackingNumber
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
