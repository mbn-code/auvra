import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    // Auth guard: hunt_queue inserts must be tied to an authenticated session.
    // createClient() reads the Supabase session from request cookies via next/headers.
    // Return 401 early if no valid session exists — prevents anonymous queue poisoning.
    const serverClient = await createClient();
    const { data: { session } } = await serverClient.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { brands, occasion } = await req.json();

    if (!brands || brands.length === 0) {
      return NextResponse.json({ error: 'Brands required for hunt' }, { status: 400 });
    }

    // 1. Log to Hunt Queue
    const { data, error } = await supabase
      .from('hunt_queue')
      .insert({
        brands,
        occasion,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Proactive notification: Log search interest
    console.log(`[Hunt] User requested deep hunt for: ${brands.join(', ')}`);

    return NextResponse.json({ success: true, huntId: data.id });
  } catch (error) {
    console.error('Hunt Error:', error);
    return NextResponse.json({ error: 'Hunt initialization failed' }, { status: 500 });
  }
}
