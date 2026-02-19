import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function forceAvailable() {
  console.log("🛠️ Forcing one item to 'available' for UI verification...");
  
  const { data, error } = await supabase
    .from('pulse_inventory')
    .select('id')
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("❌ No items found in database to force.");
    return;
  }

  const { error: updateError } = await supabase
    .from('pulse_inventory')
    .update({ status: 'available', potential_profit: 75 })
    .eq('id', data[0].id);

  if (updateError) {
    console.error("❌ Failed to update item:", updateError.message);
  } else {
    console.log("✅ Item forced to available. Check homepage now.");
  }
}

forceAvailable();
