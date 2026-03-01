import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AUVRA NEURAL MATCHING API v4.2 (Neural Activation)
 * Calculates Style Centroid from aesthetic seeds and maps to inventory DNA.
 */
export async function POST(req: Request) {
  try {
    const { selectedVibeIds, offset = 0, preferredCategory = null } = await req.json();

    if (!selectedVibeIds || selectedVibeIds.length === 0) {
      return NextResponse.json({ error: 'At least one aesthetic seed is required' }, { status: 400 });
    }

    // 1. Fetch Embeddings for Selected Vibes
    // Note: Supabase returns the 'vector' type as a numeric array directly.
    const { data: vibes, error: vibeError } = await supabase
      .from('style_latent_space')
      .select('embedding')
      .in('id', selectedVibeIds);

    if (vibeError || !vibes || vibes.length === 0) {
      console.error('[NeuralMatch] Vibe Fetch Error:', vibeError);
      return NextResponse.json({ error: 'Failed to resolve aesthetic seeds' }, { status: 500 });
    }

    // 2. Calculate the "Style Centroid" (Mathematical Average)
    // CLIP ViT-B/32 generates 512-dimension vectors.
    const embeddings = vibes.map(v => {
      // Handle potential string vs array return from Supabase client
      return typeof v.embedding === 'string' ? JSON.parse(v.embedding) : v.embedding;
    }).filter((e): e is number[] => Array.isArray(e) && e.length > 0); // guard: skip null/empty embeddings

    if (embeddings.length === 0) {
      return NextResponse.json({ error: 'No valid embeddings for selected vibes' }, { status: 500 });
    }

    const dim = embeddings[0].length;
    const centroid = Array(dim).fill(0);

    for (const emb of embeddings) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += emb[i];
      }
    }

    const finalCentroid = centroid.map(sum => sum / embeddings.length);

    // 3. Call the Neural Matching RPC
    // match_inventory_to_dna(user_dna, match_threshold, match_count, match_offset, preferred_category)
    const { data: items, error: matchError } = await supabase.rpc('match_inventory_to_dna', {
      user_dna: finalCentroid,
      match_threshold: 0.4,
      match_count: 20,
      match_offset: offset,
      preferred_category: preferredCategory
    });

    if (matchError) {
      console.error('[NeuralMatch] RPC Error:', matchError);
      return NextResponse.json({ error: 'Curation engine match failure' }, { status: 500 });
    }

    // 4. Formatting for Premium AI-First UI
    const result = items.map((item: any) => ({
      id: item.id,
      name: item.title,
      brand: item.brand,
      price: `€${Math.round(item.listing_price)}`,
      image: item.images && item.images.length > 0 ? item.images[0] : null,
      url: `https://auvra.eu/archive/${item.id}`,
      is_stable: item.is_stable,
      // Convert cosine similarity to a human-friendly match percentage
      matchScore: Math.round(item.similarity * 100)
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error('[NeuralMatch] Critical Failure:', error);
    return NextResponse.json({ error: 'Internal Neural failure' }, { status: 500 });
  }
}
