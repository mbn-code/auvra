import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/pricing', req.url));
  }

  // ?plan=annual routes to the annual price; default is monthly.
  // STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID must be set in Vercel env vars.
  const isAnnual = req.nextUrl.searchParams.get('plan') === 'annual';
  const priceId = isAnnual
    ? process.env.STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID
    : process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

  if (!priceId) {
    console.error(`[Subscribe] Missing env var: ${isAnnual ? 'STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID' : 'STRIPE_SUBSCRIPTION_PRICE_ID'}`);
    return NextResponse.json({ error: 'Subscription plan not configured' }, { status: 500 });
  }

  try {
    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: user.email,
      metadata: {
        userId: user.id,
        type: 'membership',
        plan: isAnnual ? 'annual' : 'monthly',
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
