import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectSchema() {
  console.log("🔍 Inspecting 'pulse_inventory' table structure...");
  
  // Insert a dummy item to see what keys return, or catch the error
  const { data, error } = await supabase
    .from('pulse_inventory')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Error accessing table:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ Table exists. Columns detected:");
    console.log(Object.keys(data[0]).join(", "));
    
    const requiredCols = ['last_pulse_check', 'shipping_zone'];
    const missing = requiredCols.filter(col => !Object.keys(data[0]).includes(col));
    
    if (missing.length === 0) {
      console.log("✅ All required columns (last_pulse_check, shipping_zone) FOUND.");
    } else {
      console.error(`❌ Missing columns: ${missing.join(', ')}`);
    }
  } else {
    console.log("⚠️ Table is empty, performing dry-run insert check...");
    
    const { error: insertError } = await supabase
      .from('pulse_inventory')
      .insert({ 
        vinted_id: 'test_schema_check_v2', 
        brand: 'Test', 
        title: 'Test', 
        source_price: 10, 
        listing_price: 20, 
        potential_profit: 10, 
        images: [], 
        source_url: 'http://test', 
        category: 'Test',
        last_pulse_check: new Date().toISOString(),
        shipping_zone: 'EU_ONLY'
      });

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message);
    } else {
      console.log("✅ Insert succeeded! Schema is fully patched.");
      // Cleanup
      await supabase.from('pulse_inventory').delete().eq('vinted_id', 'test_schema_check_v2');
    }
  }
}

inspectSchema();
