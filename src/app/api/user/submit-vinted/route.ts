import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Helper to calculate initial dummy curation fee if price parsing fails
import { calculateListingPriceEngine } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const supabaseUserClient = await createClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Service role client to bypass any potential RLS
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

    let pulseItemId = null;

    // Check if the item already exists in pulse_inventory
    const { data: existingInventory } = await supabaseAdmin
      .from('pulse_inventory')
      .select('id')
      .eq('vinted_id', vinted_id)
      .single();

    if (existingInventory) {
      pulseItemId = existingInventory.id;
    } else {
      // It doesn't exist, we must scrape and insert it into pulse_inventory
      let title = `User Submission #${vinted_id}`;
      let brand = "Unknown";
      let source_price = 0;
      let images: string[] = [];
      let condition = "Good";
      let category = "Archive";

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
          },
          next: { revalidate: 0 }
        });

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);

          const ogTitle = $('meta[property="og:title"]').attr('content');
          if (ogTitle) title = ogTitle;

          const ogImage = $('meta[property="og:image"]').attr('content');
          if (ogImage) images = [ogImage];

          const ogPrice = $('meta[property="product:price:amount"]').attr('content');
          if (ogPrice) source_price = parseFloat(ogPrice) || 0;

          const ogBrand = $('meta[property="product:brand"]').attr('content');
          if (ogBrand) brand = ogBrand;
          
          if (brand === "Unknown" && title.includes(' - ')) {
            brand = title.split(' - ')[0].trim();
          }
        }
      } catch (scrapeError) {
        console.warn("Cheerio scrape failed or blocked by Datadome for", url, scrapeError);
      }

      if (images.length === 0) {
        return NextResponse.json({ error: 'Could not extract an image from the Vinted listing. This is required for style DNA analysis.' }, { status: 400 });
      }

      // Generate CLIP embedding
      let style_embedding = null;
      try {
        const scriptPath = `${process.cwd()}/scripts/generate_single_embedding.py`;
        const pythonExecutable = `${process.cwd()}/venv/bin/python`;
        
        const { stdout } = await execAsync(`"${pythonExecutable}" "${scriptPath}" "${images[0]}"`);
        const result = JSON.parse(stdout.trim());
        
        if (result.embedding) {
          style_embedding = result.embedding;
        } else {
          console.error("Embedding generation returned error:", result.error);
        }
      } catch (embError) {
        console.error("Failed to generate embedding:", embError);
      }

      const safePrice = source_price > 0 ? source_price : 10;
      const listing_price = calculateListingPriceEngine(safePrice, brand, condition, title);

      // Save to pulse_inventory directly so it can be vaulted
      const { data: newInventory, error: dbError } = await supabaseAdmin.from('pulse_inventory').insert({
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
        status: 'available',
        style_embedding
      }).select('id').single();

      if (dbError) {
        console.error("DB Insert Error for Pulse Inventory:", dbError);
        return NextResponse.json({ error: 'Failed to save submission to inventory.' }, { status: 500 });
      }

      pulseItemId = newInventory.id;
    }

    // Now Vault the item for this user!
    // This will trigger update_user_dna_from_vault() and update their user_aesthetic_dna!
    const { error: vaultError } = await supabaseAdmin.from('user_vault').upsert({
      user_id: user.id,
      product_id: pulseItemId
    }, { onConflict: 'user_id, product_id' });

    if (vaultError) {
      console.error("Vault Insert Error:", vaultError);
      return NextResponse.json({ error: 'Failed to add item to your favorites.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Item added to your favorites and applied to your Profile DNA!'
    });

  } catch (err: any) {
    console.error("Unhandled error in user submit route:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
