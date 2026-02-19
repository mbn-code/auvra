import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products } from "@/config/products";
import { supabase } from "@/lib/supabase";

const ZONE_COUNTRIES: Record<string, string[]> = {
  "EU_ONLY": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
  "SCANDINAVIA_ONLY": ["DK", "SE", "NO", "FI"],
  "GLOBAL": ["US", "CA", "GB", "AU", "DE", "FR", "DK", "SE", "PL", "FI", "JP", "KR"]
};

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity } = await req.json();
    let product: any = products[productId];
    let isArchive = false;
    let shippingZone = "GLOBAL";

    if (!product) {
      const { data, error } = await supabase
        .from('pulse_inventory')
        .select('*')
        .eq('id', productId)
        .eq('status', 'available')
        .single();
      
      if (data && !error) {
        // REAL-TIME PULSE CHECK (Simulated for speed, but logic is ready)
        // In production, we can call a function that quickly checks the Vinted URL
        
        product = {
          name: data.title,
          price: data.listing_price * 100,
          currency: data.currency.toLowerCase(),
          images: data.images,
          description: data.description || `Archive piece: ${data.brand}`,
        };
        isArchive = true;
        shippingZone = data.shipping_zone || "EU_ONLY";
      }
    } else {
      shippingZone = product.shippingZone || "GLOBAL";
    }

    if (!product) {
      return NextResponse.json({ error: "Product no longer available" }, { status: 404 });
    }

    const qty = Number(quantity) || 1;
    let unitAmount = product.price;

    if (!isArchive) {
      let discount = 0;
      if (qty === 2) discount = 0.15;
      if (qty >= 3) discount = 0.25;
      unitAmount = Math.round(product.price * (1 - discount));
    }

    const allowedCountries = ZONE_COUNTRIES[shippingZone] || ZONE_COUNTRIES["EU_ONLY"];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: `${product.name} ${qty > 1 ? `(${qty} Pack Bundle)` : ""}`,
              images: product.images,
              description: product.description,
            },
            unit_amount: unitAmount,
          },
          quantity: qty,
        },
      ],
      mode: "payment",
      metadata: {
        productId: productId,
        type: isArchive ? 'archive' : 'static',
      },
      shipping_address_collection: {
        allowed_countries: allowedCountries as any,
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&id=${productId}&type=${isArchive ? 'archive' : 'static'}`,
      cancel_url: isArchive ? `${req.nextUrl.origin}/archive/${productId}` : `${req.nextUrl.origin}/product/${productId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
