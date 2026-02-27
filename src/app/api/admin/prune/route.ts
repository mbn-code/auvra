import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

/**
 * ARCHIVE PRUNING ENDPOINT
 * Periodically checks source URLs and marks 404s or sold items.
 * To be called via Vercel Cron.
 */
export async function GET(req: Request) {
  // Simple protection: Check for a secret key in headers
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(item.source_url, { 
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (res.status === 404) {
          deadItems.push(item.id);
          continue;
        }

        const text = await res.text();
        const lowerText = text.toLowerCase();
        if (lowerText.includes('"sold":true') || lowerText.includes('item is sold') || lowerText.includes('status":"sold"')) {
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
