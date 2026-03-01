import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    // Check membership tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single();

    if (!profile || profile.membership_tier !== 'society') {
      return NextResponse.json({ error: 'Society Membership Required' }, { status: 403 });
    }

    const { slots } = await req.json();

    // Fetch product details for the email
    const productIds = Object.values(slots).filter(id => id !== null) as string[];
    const { data: products } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, images')
      .in('id', productIds);

    const productsHtml = (products || []).filter(p => p.images && p.images.length > 0).map(p => `
      <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 10px;">
        <img src="${p.images[0]}" style="width: 100px; border-radius: 5px;" />
        <div style="display: inline-block; vertical-align: top; margin-left: 15px;">
          <h3 style="margin: 0;">${p.brand} - ${p.title}</h3>
          <p style="color: #666;">€${Math.round(p.listing_price)}</p>
          <a href="https://auvra.eu/archive/${p.id}" style="color: black; font-weight: bold;">View in Archive</a>
        </div>
      </div>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'Auvra <noreply@auvra.eu>',
      to: [user.email!],
      subject: 'Your Auvra Style DNA Brief',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #000;">
          <h1 style="text-transform: uppercase; letter-spacing: 0.2em;">Auvra Archive Look</h1>
          <p style="color: #666; font-style: italic;">"Manifesting aesthetics through neural Latent Space."</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          ${productsHtml}
          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">
            Society Member Exclusive Access
          </div>
        </div>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[EmailOutfit] Error:', error);
    return NextResponse.json({ error: 'Failed to send style brief' }, { status: 500 });
  }
}
