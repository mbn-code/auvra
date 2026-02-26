import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    // Check membership tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.membership_tier !== 'society') {
      return NextResponse.json({ error: 'Society Membership Required' }, { status: 403 });
    }

    const { slots, name = 'New Look' } = await req.json();

    const { data, error } = await supabase
      .from('user_outfits')
      .insert({
        user_id: session.user.id,
        name,
        slots,
        is_public: false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    console.error('[SaveOutfit] Error:', error);
    return NextResponse.json({ error: 'Failed to save look' }, { status: 500 });
  }
}
