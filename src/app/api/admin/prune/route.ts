import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

/**
 * ARCHIVE PRUNING ENDPOINT
 * Triggered via Vercel Cron.
 * Offloads the heavy work to the Sentinel (Raspberry Pi) to avoid Vercel timeouts.
 */
export async function GET(req: Request) {
  // Simple protection: Check for a secret key in headers
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Queue the prune command for the Sentinel to pick up
    const { error } = await supabase
      .from('system_commands')
      .insert({ command: 'prune', status: 'pending' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: "Prune command queued for Sentinel." 
    });

  } catch (error: any) {
    console.error('[Prune] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
