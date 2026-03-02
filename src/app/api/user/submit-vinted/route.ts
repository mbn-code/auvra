import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// Helper to calculate initial dummy curation fee if price parsing fails
import { calculateListingPriceEngine } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const supabaseUserClient = await createClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Service role client to bypass any potential RLS on unverified_assets
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.includes('vinted.')) {
      return NextResponse.json({ error: 'Invalid Vinted URL provided.' }, { status: 400 });
    }

    // Extract vinted_id from URL: e.g. https://www.vinted.fr/items/12345678-some-item
    const urlParts = url.split('/');
    const itemSlug = urlParts[urlParts.length - 1];
    const vintedIdMatch = itemSlug.match(/^(\d+)/);
    
    if (!vintedIdMatch) {
      return NextResponse.json({ error: 'Could not extract Vinted Item ID from URL.' }, { status: 400 });
    }

    const vinted_id = vintedIdMatch[1];

    // Check if the item already exists in pulse_inventory
    const { data: existingInventory } = await supabaseAdmin
      .from('pulse_inventory')
      .select('id')
      .eq('vinted_id', vinted_id)
      .single();

    if (existingInventory) {
      return NextResponse.json({ error: 'This listing is already active on the platform.' }, { status: 400 });
    }

    // Check if the item is already pending in unverified_assets
    const { data: existingUnverified } = await supabaseAdmin
      .from('unverified_assets')
      .select('id')
      .eq('vinted_id', vinted_id)
      .single();

    if (existingUnverified) {
      return NextResponse.json({ error: 'This listing has already been submitted and is pending review.' }, { status: 400 });
    }

    // Attempt to scrape basic metadata using cheerio
    // Datadome might block this, so we handle failures gracefully
    let title = `User Submission #${vinted_id}`;
    let brand = "Unknown";
    let source_price = 0;
    let images: string[] = ["https://via.placeholder.com/500?text=Pending+Image"];
    let condition = "Unknown";
    let category = "Archive";

    try {
      // Use a common User-Agent to try to bypass basic blocks, but Datadome might still catch it.
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        },
        next: { revalidate: 0 } // No caching
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        // OpenGraph tags usually survive basic SSR
        const ogTitle = $('meta[property="og:title"]').attr('content');
        if (ogTitle) title = ogTitle;

        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) images = [ogImage];

        const ogPrice = $('meta[property="product:price:amount"]').attr('content');
        if (ogPrice) source_price = parseFloat(ogPrice) || 0;

        const ogBrand = $('meta[property="product:brand"]').attr('content');
        if (ogBrand) brand = ogBrand;
        
        // Sometimes brand is in the title "Brand - Item Name"
        if (brand === "Unknown" && title.includes(' - ')) {
          brand = title.split(' - ')[0].trim();
        }
      }
    } catch (scrapeError) {
      console.warn("Cheerio scrape failed or blocked by Datadome for", url, scrapeError);
      // We continue with default placeholder values
    }

    // Calculate listing price (curation logic)
    // If source_price is 0 (blocked), we default to a baseline 10 EUR for DB constraints
    const safePrice = source_price > 0 ? source_price : 10;
    const listing_price = calculateListingPriceEngine(safePrice, brand, condition, title);

    // Save to unverified_assets
    const { data, error: dbError } = await supabaseAdmin.from('unverified_assets').upsert({
      vinted_id,
      brand,
      title,
      condition,
      source_price: safePrice,
      listing_price,
      images,
      source_url: url,
      category,
      locale: 'US',
      shipping_zone: 'EU_ONLY',
      status: 'pending', // Admins will review, or a scraper can re-verify
      submitted_by_user_id: user.id
    }, { onConflict: 'vinted_id' }).select().single();

    if (dbError) {
      console.error("DB Insert Error for User Submission:", dbError);
      return NextResponse.json({ error: 'Failed to save submission to database.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item submitted successfully! It will appear on the platform once verified.',
      item: data 
    });

  } catch (err: any) {
    console.error("Unhandled error in user submit route:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
