import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BRANDS = ["Essentials", "Corteiz", "Stussy", "Ralph Lauren"];

async function populateDB() {
  console.log("🚀 Populating database with available items...");
  const browser = await chromium.launch({ headless: true });

  for (const brand of BRANDS) {
    console.log(`🔍 Scraping ${brand}...`);
    const page = await browser.newPage();
    const searchUrl = `https://www.vinted.dk/vetements?search_text=${encodeURIComponent(brand)}&order=newest_first&new_with_tags=1`;

    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
      const items = await page.evaluate((brandName) => {
        const cards = Array.from(document.querySelectorAll('[data-testid^="grid-item"], .feed-grid__item'));
        return cards.slice(0, 3).map(card => {
          const titleLink = card.querySelector('a[href*="/items/"], a[data-testid="item-link"]');
          const priceElement = card.querySelector('[data-testid$="price"], .feed-grid__item-price');
          const img = card.querySelector('img');
          const href = titleLink?.getAttribute('href');
          const vintedId = href?.split('/')?.pop()?.split('-')?.[0];
          const title = titleLink?.getAttribute('title') || card.querySelector('.web_ui__ItemBox__title')?.textContent || '';
          let priceText = priceElement?.textContent || '';
          if (!priceText) {
             const match = title.match(/([0-9]+\.[0-9]+)/);
             if (match) priceText = match[1];
          }
          return {
            vinted_id: vintedId || '',
            title: title.trim(),
            source_url: href ? (href.startsWith('http') ? href : `https://www.vinted.dk${href}`) : '',
            source_price: parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.') || '0'),
            image: img?.src || '',
            brand: brandName
          };
        });
      }, brand);

      for (const item of items) {
        if (!item.vinted_id) continue;
        await supabase
          .from('pulse_inventory')
          .upsert({
            vinted_id: item.vinted_id,
            brand: item.brand,
            title: item.title,
            source_url: item.source_url,
            source_price: item.source_price,
            listing_price: Math.round(item.source_price * 1.4 + 15),
            images: [item.image],
            category: 'Clothing',
            confidence_score: 100,
            status: 'available'
          }, { onConflict: 'vinted_id' });
      }
      console.log(`✅ Finished ${brand}.`);
    } catch (e) {
      console.error(`💥 Error brand ${brand}:`, e);
    } finally {
      await page.close();
    }
  }
  await browser.close();
  console.log("🎉 Done!");
}

populateDB();
