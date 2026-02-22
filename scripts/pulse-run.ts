// Auvra Pulse: Master Execution Script
import { scrapeVinted } from './predator';
import { scrapeGrailed } from './grailed';
import { saveToSupabase } from './lib/inventory';
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

  // Phase 1: High Margin Luxury & Tech-wear (Grailed & Vinted)
  const highMarginBrands = ["Louis Vuitton", "Chanel", "Hermès", "Chrome Hearts", "Arc'teryx", "Stone Island"];
  
  for (const brand of highMarginBrands) {
    try {
      // Grailed Hunt (Global/US)
      const grailedItems = await scrapeGrailed(brand);
      if (grailedItems.length > 0) {
        console.log(`📦 ${brand}: Scraped ${grailedItems.length} items from Grailed`);
        for (const item of grailedItems) await saveToSupabase(item);
      }

      // Vinted Hunt (EU) - Prioritize Germany for luxury
      const vintedItems = await scrapeVinted(brand, "de");
      if (vintedItems.length > 0) {
        console.log(`📦 ${brand}: Scraped ${vintedItems.length} items from Vinted.de`);
        for (const item of vintedItems) await saveToSupabase(item);
      }
    } catch (e) {
      console.error(`💥 Failed High Margin cycle for ${brand}:`, e);
    }
  }

  // Phase 2: All Brands Cycle (Vinted - Randomized Locales)
  // We'll pick a subset of brands to avoid timeout if running on GitHub Actions
  // Or just run all if we have time. Let's run all but with small delay.
  for (const brand of BRANDS) {
    const locale = LOCALES[Math.floor(Math.random() * LOCALES.length)];
    
    try {
      const items = await scrapeVinted(brand, locale);
      console.log(`📦 ${brand}: Scanned ${items.length} items on .${locale}`);
      
      if (items.length > 0) {
        for (const item of items) await saveToSupabase(item);
      }
    } catch (err) {
      console.error(`💥 Failed cycle for ${brand}:`, err);
    }
    
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`[${new Date().toISOString()}] ✅ EUR Pulse Cycle Complete.`);
}

runPulseCycle();
