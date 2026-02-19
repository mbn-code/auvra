import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { sendOrderEmail } from "@/lib/email";
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
    
    // Retrieve metadata we set in the checkout route
    const { productId, type } = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const customerAddress = JSON.stringify(session.customer_details?.address);

    if (customerEmail && productId) {
      let productName = "Archive Piece";
      let price = `$${(session.amount_total / 100).toFixed(2)}`;
      let vintedUrl = "";
      let profit = 0;

      // Fetch product info from Supabase or Static Config
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
          
          // Mark as sold in Supabase
          await supabase
            .from('pulse_inventory')
            .update({ status: 'sold' })
            .eq('id', productId);
        }
      }

      // 1. Send customer confirmation email
      await sendOrderEmail(customerEmail, {
        productName,
        price,
        type: type as any
      });

      // 2. Send "Tap-to-Secure" notification if archive
      if (type === 'archive') {
        await sendSecureNotification({
          productName,
          vintedUrl,
          profit,
          customerName: customerName || "Customer",
          customerAddress: customerAddress || "Address in Stripe"
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
