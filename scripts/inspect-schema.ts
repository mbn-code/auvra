import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectSchema() {
  console.log("🔍 Inspecting 'pulse_inventory' table structure...");
  
  const { data, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Error accessing table:", error.message);
    return;
  }

  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log("✅ Current columns:", columns.join(", "));
    
    const required = ['member_price', 'last_pulse_check', 'shipping_zone'];
    const missing = required.filter(c => !columns.includes(c));
    
    if (missing.length === 0) {
      console.log("✅ Schema is correct.");
    } else {
      console.error("❌ Missing columns:", missing.join(", "));
    }
  } else {
    console.log("⚠️ Table empty. Testing insert with 'member_price'...");
    const { error: insertError } = await supabase
      .from('pulse_inventory')
      .insert({
        vinted_id: 'schema_test_v3',
        brand: 'Test',
        title: 'Test',
        source_price: 0,
        listing_price: 0,
        potential_profit: 0,
        images: [],
        source_url: 'http://test',
        category: 'Test',
        member_price: 0,
        last_pulse_check: new Date().toISOString(),
        shipping_zone: 'EU_ONLY'
      });

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message);
    } else {
      console.log("✅ Insert successful. 'member_price' and others exist.");
      await supabase.from('pulse_inventory').delete().eq('vinted_id', 'schema_test_v3');
    }
  }
}

inspectSchema();
