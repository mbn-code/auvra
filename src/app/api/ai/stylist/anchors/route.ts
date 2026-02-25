import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    let supabaseQuery = supabase
      .from('pulse_inventory')
      .select('id, title, brand, images, listing_price')
      .eq('status', 'available');

    if (query) {
      // Simple text search on title or brand
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,brand.ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Anchor fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch anchors' }, { status: 500 });
  }
}
