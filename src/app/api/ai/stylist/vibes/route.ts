import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AUVRA VIBE DISCOVERY API v4.2 (Neural Activation)
 * Return a high-quality pool of images from the latent space library.
 */
export const revalidate = 86400; // Strictly Cache for 24h

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (query) {
      // Perform a search across product titles and categories
      const { data: searchResults, error: searchError } = await supabase
        .from('pulse_inventory')
        .select('id, category, title')
        .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(50);

      if (searchError) throw searchError;

      const productIds = searchResults.map(r => r.id);

      // Now get the latent space records for these products
      const { data: vibes, error } = await supabase
        .from('style_latent_space')
        .select('id, image_url, archetype, product_id')
        .in('product_id', productIds);

      if (error) throw error;

      return NextResponse.json((vibes || []).map(v => ({
        id: v.id,
        url: v.image_url,
        archetype: v.archetype
      })));
    }

    // Default: Return random/recent latent space pool
    const { data: vibes, error } = await supabase
      .from('style_latent_space')
      .select('id, image_url, archetype')
      .limit(100);

    if (error) throw error;

    return NextResponse.json((vibes || []).map(v => ({
      id: v.id,
      url: v.image_url,
      archetype: v.archetype
    })));

  } catch (error) {
    console.error('[VibeDiscovery] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch latent space' }, { status: 500 });
  }
}
