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
      const { data: item, error } = await supabase
        .from('pulse_inventory')
        .select('*')
        .eq('id', productId)
        .eq('status', 'available')
        .single();
      
      if (item && !error) {
        // Pulse-Check: Verify item is still live
        try {
          const response = await fetch(item.source_url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 0 }
          });
          const html = await response.text();
          if (html.toLowerCase().includes('sold') || html.toLowerCase().includes('solgt')) {
             await supabase.from('pulse_inventory').update({ status: 'sold' }).eq('id', productId);
             return NextResponse.json({ error: "Archive Node Failure: This piece has just been secured by another party." }, { status: 410 });
          }
        } catch (e) {
          console.error("Pulse-Check Error:", e);
        }

        product = {
          name: item.title,
          price: item.listing_price * 100,
          currency: item.currency.toLowerCase(),
          images: item.images,
          description: item.description || `Archive piece: ${item.brand}`,
        };
        isArchive = true;
        shippingZone = item.shipping_zone || "EU_ONLY";
      }
    } else {
      shippingZone = product.shippingZone || "GLOBAL";
    }

    if (!product) {
      return NextResponse.json({ error: "Archive Piece no longer available" }, { status: 404 });
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
