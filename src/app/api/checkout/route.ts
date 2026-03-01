import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products as staticProducts } from "@/config/products";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";

const ZONE_COUNTRIES: Record<string, string[]> = {
  "EU_ONLY": ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"],
  "SCANDINAVIA_ONLY": ["DK", "SE", "NO", "FI"],
  "GLOBAL": ["US", "CA", "GB", "AU", "DE", "FR", "DK", "SE", "PL", "FI", "JP", "KR"]
};

export async function POST(req: NextRequest) {
  try {
    const { productId, productIds: passedProductIds, quantity, cancelUrl: passedCancelUrl } = await req.json();
    
    const productIds = passedProductIds || (productId ? [productId] : []);
    if (productIds.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    // Determine cancel URL: body > Referer header > default
    const referrer = req.headers.get("referer");
    const cancelUrl = passedCancelUrl || referrer || `${req.nextUrl.origin}/stylist`;

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
    let shippingZone = "GLOBAL"; // Start permissive, narrow down as items are inspected
    let isPreOrder = false;

    // Pre-fetch all non-static items in one go
    const dbItemIds = productIds.filter((id: string) => !staticProducts[id]);
    let fetchedItems: Record<string, any> = {};
    if (dbItemIds.length > 0) {
      const { data: items, error } = await supabase
        .from('pulse_inventory')
        .select('*')
        .in('id', dbItemIds);
      
      if (!error && items) {
        items.forEach(item => {
          fetchedItems[item.id] = item;
        });
      }
    }

    for (const id of productIds) {
      let product: any = staticProducts[id];
      let isArchive = false;

      if (!product) {
        const item = fetchedItems[id];
        
        if (!item || (item.status !== 'available' && !item.is_stable)) {
          unavailableItems.push(id);
          continue;
        }

        // If it's a stable pre-order item, set the flag
        if (item.is_stable && item.pre_order_status) {
          isPreOrder = true;
        }

        // Determine correct base price for stable/pre-order items
        let basePrice = item.listing_price;
        if (item.is_stable) {
          if (item.units_sold_count < item.early_bird_limit && item.early_bird_price) {
            basePrice = item.early_bird_price;
          } else if (item.pre_order_status && item.preorder_price) {
            basePrice = item.preorder_price;
          }
        }

        const finalPrice = isMember ? (item.member_price || Math.round(basePrice * 0.9)) : basePrice;

        product = {
          name: item.title,
          price: Math.round(finalPrice * 100), // Convert to cents
          currency: item.currency.toLowerCase(),
          images: item.images,
          description: item.description || `Archive piece: ${item.brand}`,
        };
        isArchive = true;
        // Most-restrictive zone wins across all items in the cart
        if (item.shipping_zone === "EU_ONLY") shippingZone = "EU_ONLY";
        else if (item.shipping_zone === "SCANDINAVIA_ONLY" && shippingZone !== "EU_ONLY") shippingZone = "SCANDINAVIA_ONLY";
        // GLOBAL: no change needed — GLOBAL is the permissive default
      } else {
        // Static product from config — apply its shippingZone with the same narrowing logic
        const staticZone = (product as any)?.shippingZone ?? "GLOBAL";
        if (staticZone === "EU_ONLY") shippingZone = "EU_ONLY";
        else if (staticZone === "SCANDINAVIA_ONLY" && shippingZone !== "EU_ONLY") shippingZone = "SCANDINAVIA_ONLY";
        // GLOBAL: no change needed
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

    // PHASE 2 CIS: Retrieve Attribution Cookies
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auvra_session_id')?.value || cookieStore.get('auvra_fingerprint')?.value || 'unknown_session';
    const creativeId = cookieStore.get('auvra_creative_id')?.value || '';

    // Determine the cart type so the webhook can branch correctly.
    // 'archive' = all items are from pulse_inventory (1-of-1 pieces)
    // 'static'  = all items are from config/products (physical utility goods)
    // 'mixed'   = combination of both (rare but possible from the stylist canvas)
    const allArchive = productIds.every((id: string) => !staticProducts[id]);
    const allStatic  = productIds.every((id: string) => !!staticProducts[id]);
    const cartType   = allArchive ? 'archive' : allStatic ? 'static' : 'mixed';

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        // productIds (plural, comma-joined) — full cart list for the webhook.
        productIds: productIds.join(','),
        // productId (singular) — first item; kept for webhook branch compatibility.
        productId: productIds[0] ?? '',
        type: cartType,
        userId: user?.id ?? '',
        isMember: isMember ? 'true' : 'false',
        preOrder: isPreOrder ? 'true' : 'false',
        // PHASE 2 CIS: Pass attribution data to Stripe to close the loop
        sessionId: sessionId,
        creativeId: creativeId
      },
      shipping_address_collection: {
        allowed_countries: allowedCountries as any,
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
