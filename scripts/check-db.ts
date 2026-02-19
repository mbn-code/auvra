import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumns() {
  const { data, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Error fetching from table:", error.message);
  } else if (data && data.length > 0) {
    console.log("✅ Current columns in 'pulse_inventory':", Object.keys(data[0]));
  } else {
    console.log("⚠️ Table exists but is empty.");
  }
}

checkColumns();
