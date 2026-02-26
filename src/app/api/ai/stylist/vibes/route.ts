import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AUVRA VIBE DISCOVERY API v4.2 (Neural Activation)
 * Return a high-quality pool of images from the latent space library.
 */
export const revalidate = 86400; // Strictly Cache for 24h

export async function GET(req: NextRequest) {
  try {
    // Fetch a high-quality pool from the latent space to allow frontend shuffling
    // We pick 100 items for diversity while maintaining response performance
    const { data: vibes, error } = await supabase
      .from('style_latent_space')
      .select('id, image_url, archetype')
      .limit(100);

    if (error) throw error;

    // We return the stable pool of 100 items. 
    // Randomization is handled on the client to circumvent 24h cache persistence.
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
