import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products as staticProducts } from "@/config/products";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

const ZONE_COUNTRIES: Record<string, string[]> = {
  "EU_ONLY": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
  "SCANDINAVIA_ONLY": ["DK", "SE", "NO", "FI"],
  "GLOBAL": ["US", "CA", "GB", "AU", "DE", "FR", "DK", "SE", "PL", "FI", "JP", "KR"]
};

export async function POST(req: NextRequest) {
  try {
    const { productId, productIds: passedProductIds, quantity } = await req.json();
    
    const productIds = passedProductIds || (productId ? [productId] : []);
    if (productIds.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    // Check Membership Status
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    let isMember = false;

    if (user) {
      const { data: profile } = await authSupabase
        .from('profiles')
        .select('membership_tier')
        .eq('id', user.id)
        .single();
      if (profile?.membership_tier === 'society') isMember = true;
    }

    const lineItems = [];
    const unavailableItems = [];
    let shippingZone = "EU_ONLY"; // Default to stricter zone if mixing

    for (const id of productIds) {
      let product: any = staticProducts[id];
      let isArchive = false;

      if (!product) {
        const { data: item, error } = await supabase
          .from('pulse_inventory')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!item || error || item.status !== 'available') {
          unavailableItems.push(id);
          continue;
        }

        // Pulse-Check: Verify item is still live (Only 404 means definitively sold)
        try {
          const response = await fetch(item.source_url, {
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 0 }
          });
          if (response.status === 404) {
             await supabase.from('pulse_inventory').update({ status: 'sold' }).eq('id', id);
             unavailableItems.push(id);
             continue; // Skip sold items
          }
        } catch (e) {
          console.error("Pulse-Check Error:", e);
        }

        const basePrice = item.listing_price;
        const finalPrice = isMember ? (item.member_price || Math.round(basePrice * 0.9)) : basePrice;

        product = {
          name: item.title,
          price: finalPrice * 100, // Convert to cents
          currency: item.currency.toLowerCase(),
          images: item.images,
          description: item.description || `Archive piece: ${item.brand}`,
        };
        isArchive = true;
        // If any item is EU_ONLY, the whole session becomes EU_ONLY for safety
        if (item.shipping_zone === "EU_ONLY") shippingZone = "EU_ONLY";
        else if (item.shipping_zone === "SCANDINAVIA_ONLY" && shippingZone !== "EU_ONLY") shippingZone = "SCANDINAVIA_ONLY";
      }

      if (product) {
        // ... unitAmount logic ...
        const qty = productIds.length === 1 ? (Number(quantity) || 1) : 1;
        let unitAmount = product.price;

        if (!isArchive) {
          if (isMember) {
            unitAmount = Math.round(unitAmount * 0.9);
          } else if (qty > 1) {
            let discount = 0;
            if (qty === 2) discount = 0.15;
            if (qty >= 3) discount = 0.25;
            unitAmount = Math.round(product.price * (1 - discount));
          }
        }

        lineItems.push({
          price_data: {
            currency: product.currency,
            product_data: {
              name: `${product.name} ${isMember ? '(Member Price)' : ''}`,
              images: product.images,
              description: product.description,
            },
            unit_amount: unitAmount,
          },
          quantity: qty,
        });
      }
    }

    // If some items are unavailable, we inform the user instead of proceeding with a partial cart
    // This prevents confusion about why the price or item list changed.
    if (unavailableItems.length > 0) {
      return NextResponse.json({ 
        error: "Inventory Conflict", 
        unavailableIds: unavailableItems 
      }, { status: 409 }); // 409 Conflict
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "Items no longer available" }, { status: 404 });
    }

    const allowedCountries = ZONE_COUNTRIES[shippingZone] || ZONE_COUNTRIES["EU_ONLY"];

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        productIds: productIds.join(','),
        type: 'mixed',
        isMember: isMember ? 'true' : 'false'
      },
      shipping_address_collection: {
        allowed_countries: allowedCountries as any,
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/stylist`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
