// Auvra Pulse: Test Script
import { scrapeBrand, calculateConfidence } from './predator';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPulse() {
  console.log("🚀 Initializing Auvra Pulse Test...");
  const brand = "Carhartt";
  const locale = "pl";

  console.log(`🔍 Searching for ${brand} on Vinted.${locale}...`);

  try {
    const items = await scrapeBrand(brand, locale);
    console.log(`✅ Found ${items.length} items.`);
    
    if (items.length > 0) {
      console.log("📤 Syncing first item to Supabase (Available status)...");
      const item = items[0];
      const listingPrice = Math.round(item.source_price * 1.4 + 15);
      const profit = listingPrice - item.source_price - 15;

      const { error } = await supabase
        .from('pulse_inventory')
        .upsert({
          vinted_id: item.vinted_id,
          brand: item.brand,
          title: item.title,
          source_url: item.source_url,
          source_price: item.source_price,
          listing_price: listingPrice,
          potential_profit: profit,
          images: [item.image],
          category: 'Clothing',
          condition: item.condition,
          confidence_score: calculateConfidence(item),
          status: 'available', 
          locale: locale
        }, { onConflict: 'vinted_id' });

      if (error) console.error("❌ Sync Error:", error.message);
      else console.log("🎉 Test item synced successfully.");
    }
  } catch (err) {
    console.error("❌ Scrape Error:", err);
  }
}

testPulse();
