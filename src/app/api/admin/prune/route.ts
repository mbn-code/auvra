import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

/**
 * ARCHIVE PRUNING ENDPOINT
 * Triggered via Vercel Cron (see vercel.json).
 * Queues a prune command for the Sentinel (Raspberry Pi) to pick up.
 *
 * Security: The Authorization header must contain the CRON_SECRET value, which
 * should be a cryptographically random 32-byte hex string (64 characters).
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Idempotency: If a 'prune' command is already pending or running, we skip
 * inserting a duplicate. This prevents pile-up if Vercel fires the cron more
 * than once within a window (e.g. on retry after a timeout).
 */
export async function GET(req: Request) {
  // Validate the cron secret — must be present and match exactly.
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Idempotency check: skip if a prune command is already pending or running.
    // This prevents queuing multiple commands if cron fires more than once.
    const { data: existing } = await supabase
      .from('system_commands')
      .select('id')
      .eq('command', 'prune')
      .in('status', ['pending', 'running'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Prune command already queued or running — skipping duplicate.',
        idempotent: true,
      });
    }

    // Queue the prune command for the Sentinel to pick up.
    const { error } = await supabase
      .from('system_commands')
      .insert({ command: 'prune', status: 'pending' });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Prune command queued for Sentinel.',
    });

  } catch (error: any) {
    console.error('[Prune] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
