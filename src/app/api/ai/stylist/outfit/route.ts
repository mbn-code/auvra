import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * AUVRA OUTFIT HYDRATION API
 * Fetches product details for stored lookbook IDs.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    // 1. Fetch the outfit
    const { data: outfitData, error: outfitError } = await supabase
      .from('user_outfits')
      .select('*')
      .eq('id', id)
      .single();

    if (outfitError || !outfitData) throw new Error('Outfit not found');

    // 2. Hydrate slots (fetch product details for IDs)
    const productIds = Object.values(outfitData.slots).filter(v => v !== null) as string[];
    
    if (productIds.length === 0) {
      return NextResponse.json({ outfit: outfitData.slots });
    }

    const { data: products, error: prodError } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, images, category, potential_profit, status')
      .in('id', productIds);

    if (prodError) throw prodError;

    // Map products back to slots as ARRAYS (for v5.1+ compatibility)
    const hydratedOutfit: any = {};
    Object.keys(outfitData.slots).forEach(slotKey => {
      const prodId = outfitData.slots[slotKey];
      const product = products?.find(p => p.id === prodId);
      if (product) {
        hydratedOutfit[slotKey] = [{
          id: product.id,
          name: product.title,
          brand: product.brand,
          price: `€${Math.round(product.listing_price)}`,
          image: product.images[0],
          category: product.category,
          status: product.status,
          matchScore: 100
        }];
      } else {
        hydratedOutfit[slotKey] = [];
      }
    });

    return NextResponse.json({ outfit: hydratedOutfit });

  } catch (error: any) {
    console.error('[FetchOutfit] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
