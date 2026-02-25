import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getImageEmbedding } from '@/lib/vector-utils';

/**
 * AUVRA NEURAL SEARCH API
 * Executes Vector Similarity Search using pgvector
 */

export async function POST(req: NextRequest) {
  try {
    const { vibeId, imageUrl, threshold = 0.5, count = 50 } = await req.json();

    let embedding: number[] | null = null;

    // 1. Get the embedding (either from a precomputed vibe or by processing an image URL)
    if (imageUrl) {
      embedding = await getImageEmbedding(imageUrl);
    } else if (vibeId) {
      // In a more advanced version, we'd fetch precomputed vibe embeddings from a 'vibes' table
      // For now, we simulate by using the vibe's known reference image
      const vibeMap: Record<string, string> = {
        'gorpcore': 'https://auvra.eu/vibes/6f85c4b2f69fdb8f0f54a5cffd985ba5.jpg',
        'archive': 'https://auvra.eu/vibes/191a6aaa3f480f2ca33d814d52ff3b62.jpg',
        'quiet-luxury': 'https://auvra.eu/vibes/cfd79f46ca1eb048b72ecf2cb5f2de2f.jpg',
        'darkwear': 'https://auvra.eu/vibes/0040bbdd6243abec640061ab426e88cb.jpg',
        '90s-street': 'https://auvra.eu/vibes/13f4a2472ed97b368a0730167372c4cc.jpg'
      };
      
      const refUrl = vibeMap[vibeId];
      if (refUrl) embedding = await getImageEmbedding(refUrl);
    }

    if (!embedding) {
      return NextResponse.json({ error: 'No search criteria provided' }, { status: 400 });
    }

    // 2. Execute RPC call to match vectors in Supabase
    // We use the match_inventory_vibes function defined in our migration
    const { data, error } = await supabase.rpc('match_inventory_vibes', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: count,
    });

    if (error) {
      console.error('Vector Search DB Error:', error);
      
      // FALLBACK: If pgvector is not yet configured or items have no embeddings,
      // return a standard high-quality archive query to prevent UI break
      const { data: fallbackData } = await supabase
        .from('pulse_inventory')
        .select('*')
        .eq('status', 'available')
        .order('listing_price', { ascending: false })
        .limit(count);
        
      return NextResponse.json(fallbackData || []);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Neural Search Error:', error);
    return NextResponse.json({ error: 'Neural Engine failure' }, { status: 500 });
  }
}
