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

    let supabaseQuery = supabase
      .from('style_latent_space')
      .select('id, image_url, archetype');

    if (query) {
      supabaseQuery = supabaseQuery.ilike('archetype', `%${query}%`).limit(50);
    } else {
      supabaseQuery = supabaseQuery.limit(100);
    }

    const { data: vibes, error } = await supabaseQuery;

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
