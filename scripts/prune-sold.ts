import { createClient } from '@supabase/supabase-js';
import { checkVintedLive } from './lib/inventory';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function pruneSold() {
  console.log("🧹 Starting inventory pruning (Oldest 50 Available)...");
  const { data: items, error } = await supabase
    .from('pulse_inventory')
    .select('id, source_url, title')
    .eq('status', 'available')
    .neq('status', 'owned') // Skip owned items
    .order('last_seen_at', { ascending: true })
    .limit(50);

  if (error || !items) {
    console.error("Error fetching items:", error);
    return;
  }

  console.log(`Checking ${items.length} items...`);

  for (const item of items) {
    try {
      const isLive = await checkVintedLive(item.source_url);
      if (!isLive) {
        console.log(`❌ [SOLD/GONE] ${item.title}`);
        await supabase.from('pulse_inventory').update({ status: 'sold' }).eq('id', item.id);
      } else {
        console.log(`✅ [LIVE] ${item.title}`);
        // Update last_seen_at so we don't check it again immediately
        await supabase.from('pulse_inventory').update({ last_seen_at: new Date().toISOString() }).eq('id', item.id);
      }
    } catch (e) {
      console.error(`Failed to check ${item.id}:`, e);
    }
  }
  console.log("✨ Pruning cycle complete.");
}

pruneSold();
