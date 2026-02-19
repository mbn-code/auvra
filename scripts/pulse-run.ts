// Auvra Pulse: Master Execution Script
import { scrapeBrand, saveToSupabase } from './predator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BRANDS = [
  "Louis Vuitton", "Chrome Hearts", "Canada Goose", "Syna World", 
  "Corteiz", "Moncler", "Hermès", "Chanel", "CP Company", "ASICS", 
  "Supreme", "Lacoste", "Zara", "Prada", "Essentials", "Burberry", 
  "Timberland", "Ralph Lauren", "Amiri", "Sp5der", "Stüssy", 
  "A Bathing Ape", "Broken Planet", "Denim Tears", "Hellstar", 
  "Eric Emanuel", "Gallery Dept", "Stone Island"
];

const LOCALES = ["dk", "de", "pl", "se", "fi"];

async function runPulseCycle() {
  console.log(`[${new Date().toISOString()}] 🚀 Starting Regional Pulse Cycle (EU Cluster)...`);

  for (const brand of BRANDS) {
    const locale = LOCALES[Math.floor(Math.random() * LOCALES.length)];
    
    try {
      const items = await scrapeBrand(brand, locale);
      console.log(`📦 ${brand}: Found ${items.length} items on .${locale}`);
      
      if (items.length > 0) {
        await saveToSupabase(items);
      }
    } catch (err) {
      console.error(`💥 Failed cycle for ${brand}:`, err);
    }
    
    // Throttle to avoid Vinted / Cloudinary rate limits
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log(`[${new Date().toISOString()}] ✅ Regional Pulse Cycle Complete.`);
}

runPulseCycle();
