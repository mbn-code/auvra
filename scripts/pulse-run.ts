// Auvra Pulse: Master Execution Script
import { scrapeVinted } from './predator';
import { scrapeGrailed } from './grailed';
import { saveToSupabase } from './lib/inventory';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BRANDS = [
  "Louis Vuitton", "Chrome Hearts", "Canada Goose", "Syna World", 
  "Corteiz", "Moncler", "Hermès", "Chanel", "CP Company", "ASICS", 
  "Supreme", "Lacoste", "Zara", "Prada", "Essentials", "Burberry", 
  "Timberland", "Ralph Lauren", "Amiri", "Sp5der", "Stüssy", 
  "A Bathing Ape", "Broken Planet", "Denim Tears", "Hellstar", 
  "Eric Emanuel", "Gallery Dept", "Stone Island", "Patagonia", 
  "New Balance", "Salomon", "Oakley", "Dickies", "Diesel", "Levis", 
  "Adidas", "Nike", "Gucci", "New Era", "MLB", "Takashi Murakami"
];

const LOCALES = ["dk", "de", "pl", "se", "fi"];

async function checkHuntQueue() {
  const { data: queue, error } = await supabase
    .from('hunt_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(1);

  if (error || !queue || queue.length === 0) return null;
  return queue[0];
}

async function runPulseCycle() {
  const args = process.argv.slice(2);
  let targetBrands = args.length > 0 ? args : null;

  // 0. Check for user-requested hunts first
  const hunt = await checkHuntQueue();
  if (hunt) {
    console.log(`[Hunt] User requested deep hunt for: ${hunt.brands.join(', ')}`);
    targetBrands = hunt.brands;
    await supabase.from('hunt_queue').update({ status: 'hunting', last_hunt_at: new Date().toISOString() }).eq('id', hunt.id);
  }

  console.log(`[${new Date().toISOString()}] 🚀 Starting ${targetBrands ? 'Targeted Hunt' : 'Global Pulse Cycle'}...`);

  const brandsToRun = targetBrands || BRANDS;
  
  for (const brand of brandsToRun) {
    try {
      // Vinted Hunt - Cycle through locales for more results
      for (const locale of LOCALES) {
        const vintedItems = await scrapeVinted(brand, locale);
        if (vintedItems.length > 0) {
          console.log(`📦 ${brand}: Scraped ${vintedItems.length} items from Vinted.${locale}`);
          for (const item of vintedItems) await saveToSupabase(item);
        }
        if (targetBrands) await new Promise(r => setTimeout(r, 1000));
      }

      const grailedItems = await scrapeGrailed(brand);
      if (grailedItems.length > 0) {
        console.log(`📦 ${brand}: Scraped ${grailedItems.length} items from Grailed`);
        for (const item of grailedItems) await saveToSupabase(item);
      }
    } catch (e) {
      console.error(`💥 Failed cycle for ${brand}:`, e);
    }
    
    if (!targetBrands) await new Promise(r => setTimeout(r, 3000));
  }

  if (hunt) {
    await supabase.from('hunt_queue').update({ status: 'completed' }).eq('id', hunt.id);
  }

  console.log(`[${new Date().toISOString()}] ✅ Cycle Complete.`);
}

runPulseCycle();
