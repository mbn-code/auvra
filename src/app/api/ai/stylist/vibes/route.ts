import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Dynamic Route - Handled on demand due to search params
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
        .eq('status', 'available') // Only discover available items if searching
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
      })), {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      });
    }

    // Default: Return random pool of currently available items for discovery
    const { data: vibes, error } = await supabase
      .from('style_latent_space')
      .select(`
        id, 
        image_url, 
        archetype,
        pulse_inventory!inner(status)
      `)
      .eq('pulse_inventory.status', 'available')
      .limit(100);

    if (error) throw error;

    return NextResponse.json((vibes || []).map((v: any) => ({
      id: v.id,
      url: v.image_url,
      archetype: v.archetype
    })), {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('[VibeDiscovery] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch latent space' }, { status: 500 });
  }
}
