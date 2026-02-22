import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login?redirect=/pricing', req.url));
  }

  try {
    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        type: 'membership'
      },
      success_url: `${req.nextUrl.origin}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
    });

    return NextResponse.redirect(sessionStripe.url!);
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
