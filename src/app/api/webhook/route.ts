import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { products } from "@/config/products";
import { sendOrderEmail, sendSocietyActiveEmail } from "@/lib/email";
import { sendSecureNotification } from "@/lib/notifications";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // PHASE 2 CIS: Extract sessionId and creativeId from session.metadata
    const { productId, type, userId, sessionId, creativeId, preOrder } = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // ... (rest of the logic)

    // HANDLE PRODUCT PURCHASE
    if (customerEmail && productId) {
      let productName = "Archive Piece";
      let price = `€${(session.amount_total / 100).toFixed(2)}`;
      let vintedUrl = "";
      let profit = 0;

      // PHASE 2 CIS: Log the purchase event to pulse_events
      const safeSessionId = sessionId || 'unknown';
      const safeCreativeId = creativeId || null;
      const stripeEventId = event.id;

      const { data: existingEvent } = await supabase
        .from('pulse_events')
        .select('id')
        .eq('event_type', 'purchase')
        .contains('metadata', { stripe_event_id: stripeEventId })
        .maybeSingle();

      if (!existingEvent) {
        await supabase.rpc('batch_insert_pulse_events', {
          events: [{
            session_id: safeSessionId,
            creative_id: safeCreativeId,
            event_type: 'purchase',
            metadata: { 
              revenue: (session.amount_total / 100),
              stripe_event_id: stripeEventId
            },
            timestamp: new Date().toISOString()
          }]
        });
      }

      if (type === 'archive') {
        const { data: item } = await supabase
          .from('pulse_inventory')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (item) {
          productName = item.title;
          vintedUrl = item.source_url;
          profit = item.potential_profit;
          
          if (!item.is_stable) {
            await supabase.from('pulse_inventory').update({ status: 'sold' }).eq('id', productId);
          } else {
            // Decrement stock for stable items
            await supabase.rpc('decrement_stock', { item_id: productId });
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

      // Determine initial order status
      const initialStatus = preOrder === 'true' ? 'awaiting_manufacturing_allocation' : 'pending_secure';

      // Create Order Record for Terminal
      await supabase.from('orders').insert({
        stripe_session_id: session.id,
        product_id: type === 'archive' ? productId : null,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: session.customer_details?.address,
        source_url: vintedUrl,
        status: initialStatus
      });

      // Send Order Confirmation
      await sendOrderEmail(customerEmail, {
        productName,
        price,
        type: type as any
      });

      // Send Tap-to-Secure Notification
      if (vintedUrl) {
        await sendSecureNotification({
          productName,
          vintedUrl,
          profit,
          customerName: customerName || "Customer",
          customerAddress: `${session.customer_details?.address?.line1}, ${session.customer_details?.address?.city}`
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
