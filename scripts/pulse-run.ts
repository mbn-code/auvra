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
  "Eric Emanuel", "Gallery Dept", "Stone Island", "Patagonia", 
  "New Balance", "Salomon", "Oakley", "Dickies", "Diesel", "Levis", 
  "Adidas", "Nike"
];

const LOCALES = ["dk", "de", "pl", "se", "fi"];

async function runPulseCycle() {
  console.log(`[${new Date().toISOString()}] 🚀 Starting Regional EUR Pulse Cycle...`);

  // Phase 1: High Margin Luxury & Tech-wear
  const highMarginBrands = ["Louis Vuitton", "Chanel", "Chrome Hearts", "Arc'teryx", "Stone Island"];
  for (const brand of highMarginBrands) {
    try {
      // Prioritize France/Germany for Luxury
      const items = await scrapeBrand(brand, "de");
      if (items.length > 0) await saveToSupabase(items);
    } catch (e) {}
  }

  // Phase 2: All Brands Cycle
  for (const brand of BRANDS) {
    const locale = LOCALES[Math.floor(Math.random() * LOCALES.length)];
    
    try {
      const items = await scrapeBrand(brand, locale);
      console.log(`📦 ${brand}: Scanned ${items.length} items on .${locale}`);
      
      if (items.length > 0) {
        await saveToSupabase(items);
      }
    } catch (err) {
      console.error(`💥 Failed cycle for ${brand}:`, err);
    }
    
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log(`[${new Date().toISOString()}] ✅ EUR Pulse Cycle Complete.`);
}

runPulseCycle();
