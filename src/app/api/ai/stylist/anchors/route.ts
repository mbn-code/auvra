import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, images, listing_price')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch anchors' }, { status: 500 });
  }
}
