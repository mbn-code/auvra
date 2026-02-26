import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/**
 * ARCHIVE PRUNING ENDPOINT
 * Periodically checks source URLs and marks 404s as sold.
 * To be called via Vercel Cron.
 */
export async function GET(req: Request) {
  // Simple protection: Check for a secret key in headers
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // 1. Fetch items to check
    const { data: items, error: fetchError } = await supabase
      .from('pulse_inventory')
      .select('id, source_url')
      .eq('status', 'available')
      .limit(50); // Small batches to stay within timeout

    if (fetchError || !items) throw fetchError;

    const deadItems: string[] = [];

    // 2. Check each URL (Sequential to be gentle on marketplaces)
    for (const item of items) {
      try {
        const res = await fetch(item.source_url, { method: 'HEAD', timeout: 5000 } as any);
        if (res.status === 404) {
          deadItems.push(item.id);
        }
      } catch (e) {
        // Skip on timeout/other errors
      }
    }

    // 3. Mark as sold
    if (deadItems.length > 0) {
      await supabase
        .from('pulse_inventory')
        .update({ status: 'sold' })
        .in('id', deadItems);
    }

    return NextResponse.json({ 
      processed: items.length, 
      pruned: deadItems.length 
    });

  } catch (error: any) {
    console.error('[Prune] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
