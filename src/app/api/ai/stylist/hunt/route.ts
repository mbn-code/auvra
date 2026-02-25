import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
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
