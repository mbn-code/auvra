import { createClient } from '@supabase/supabase-js';
import { calculateListingPrice, convertToEUR } from './predator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We need a standalone convertToEUR since predator exports it but uses internal constants
// which might not be exported. Let's just redefine it simply here or rely on source_price being correct.
// Actually, items in DB already have source_price stored in EUR (from previous scrape).
// Wait, predator.ts stores source_price in EUR. So we don't need convertToEUR again.

async function recalculatePrices() {
  console.log("🔄 Starting price recalculation for pending items...");
  
  const { data: items, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'pending_review');

  if (error || !items) {
    console.error("❌ Error fetching items:", error?.message);
    return;
  }

  console.log(`Found ${items.length} pending items.`);

  for (const item of items) {
    // source_price is already EUR in the database as per recent predator script
    const newListingPrice = calculateListingPrice(item.source_price, item.brand);
    const newProfit = newListingPrice - item.source_price - 20;

    if (newListingPrice !== item.listing_price) {
      console.log(`📝 Updating ${item.vinted_id}: €${item.listing_price} -> €${newListingPrice}`);
      
      await supabase
        .from('pulse_inventory')
        .update({ 
          listing_price: newListingPrice,
          potential_profit: newProfit
        })
        .eq('id', item.id);
    }
  }
  
  console.log("✅ Price recalculation complete.");
}

recalculatePrices();
