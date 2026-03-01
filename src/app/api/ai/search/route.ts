import { NextRequest, NextResponse } from 'next/server';

/**
 * AUVRA NEURAL SEARCH API
 * Vector similarity search via pgvector + Sentinel CLIP embeddings.
 *
 * STATUS: Not implemented — getImageEmbedding is a stub that returns a
 * deterministic fake vector, so all similarity results are meaningless.
 * This endpoint is disabled until the Sentinel CLIP API is integrated and
 * real embeddings are stored in pulse_inventory.embedding.
 *
 * TODO: Re-enable once Sentinel /embed endpoint is live and embeddings are
 * populated. Remove this guard and restore the match_inventory_vibes RPC call.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Neural search is not yet available. Sentinel CLIP integration pending.',
      code: 'NEURAL_SEARCH_UNAVAILABLE',
    },
    { status: 501 }
  );
}
