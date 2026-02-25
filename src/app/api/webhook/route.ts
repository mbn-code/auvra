import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
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
    
    const { productId, type, userId } = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // HANDLE MEMBERSHIP SUBSCRIPTION
    if (type === 'membership' && userId) {
      await supabase
        .from('profiles')
        .update({
          membership_tier: 'society',
          stripe_customer_id: session.customer,
          subscription_status: 'active'
        })
        .eq('id', userId);
        
      if (customerEmail) {
        await sendSocietyActiveEmail(customerEmail);
      }
        
      console.log(`✅ Membership activated for user ${userId}`);
      return NextResponse.json({ received: true });
    }

    // HANDLE PRODUCT PURCHASE
    if (customerEmail && productId) {
      let productName = "Archive Piece";
      let price = `€${(session.amount_total / 100).toFixed(2)}`;
      let vintedUrl = "";
      let profit = 0;

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
          
          await supabase.from('pulse_inventory').update({ status: 'sold' }).eq('id', productId);
        }
      } else {
        const staticProduct = products[productId];
        if (staticProduct) {
          productName = staticProduct.name;
          vintedUrl = staticProduct.sourceUrl || "";
          profit = (staticProduct.price / 100) - 15;
        }
      }

      // Create Order Record for Terminal
      await supabase.from('orders').insert({
        stripe_session_id: session.id,
        product_id: type === 'archive' ? productId : null,
        customer_email: customerEmail,
        customer_name: customerName,
        shipping_address: session.customer_details?.address,
        source_url: vintedUrl,
        status: 'pending_secure'
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
