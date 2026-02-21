import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupDB() {
  console.log("🧹 Cleaning up all items from pulse_inventory table...");
  
  const { error } = await supabase
    .from('pulse_inventory')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all where ID is not a dummy ID

  if (error) {
    console.error("❌ Cleanup Error:", error.message);
  } else {
    console.log(`✅ Successfully removed all items from pulse_inventory.`);
  }
}

cleanupDB();
