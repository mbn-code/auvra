import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StylistEngine, UserIntent } from '@/lib/stylist-engine';

/**
 * AUVRA STYLIST API v2
 * High-Integrity Deterministic Outfit Coordination
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { colors, brands, occasion, gender } = body;

    const intent: UserIntent = {
      colors,
      brands,
      occasion,
      gender: gender === 'couple' ? 'couple' : (gender || 'unisex')
    };

    // 1. INVENTORY ADAPTER (Fetch & Enrich)
    const { data: rawInventory, error } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, category, images, status')
      .eq('status', 'available')
      .limit(1000);

    if (error || !rawInventory) {
      return NextResponse.json({ error: 'Inventory sync failed' }, { status: 500 });
    }

    const inventory = StylistEngine.enrichInventory(rawInventory);

    // 2. COUPLE MATCHING PROTOCOL
    if (intent.gender === 'couple') {
      const maleInventory = inventory.filter(i => i.gender !== 'female');
      const femaleInventory = inventory.filter(i => i.gender !== 'male');

      const maleCandidates = StylistEngine.generateGuidedOutfits(maleInventory, { ...intent, gender: 'male' }, 50);
      const femaleCandidates = StylistEngine.generateGuidedOutfits(femaleInventory, { ...intent, gender: 'female' }, 50);

      const couples = [];
      // Use double loop but with strict coordination scoring
      for (const m of maleCandidates.slice(0, 20)) {
        for (const f of femaleCandidates.slice(0, 20)) {
          if (couples.length >= 5) break;
          
          const coordScore = StylistEngine.coordinationScore(m, f);
          if (coordScore >= 80) {
            couples.push({
              outfitName: "Coordinated Network Set",
              isCouple: true,
              coordinationScore: coordScore,
              male: formatOutfit(m),
              female: formatOutfit(f),
              styleReason: `Synchronized ${m.dominantCluster} nodes with shared ${m.items[0].colorFamily} palette.`
            });
          }
        }
      }

      // If no perfect matches, return top individual ones or lower threshold
      return NextResponse.json(couples.slice(0, 5));
    }

    // 3. STANDARD SINGLE PROTOCOL
    const allOutfits = StylistEngine.generateGuidedOutfits(inventory, intent, 100);
    const diverseOutfits = StylistEngine.diversityFilter(allOutfits, 5);

    // 4. FORMATTING
    const result = diverseOutfits.map(o => formatOutfit(o));

    return NextResponse.json(result);

  } catch (error) {
    console.error('Stylist Error:', error);
    return NextResponse.json({ error: 'Styling engine failure' }, { status: 500 });
  }
}

function formatOutfit(o: any) {
  return {
    outfitName: o.outfitName || "Signature Archive Set",
    outfitScore: o.score.total,
    styleReason: o.styleReason || `A coherent ${o.dominantCluster} curation anchored by ${o.items[0].brand} aesthetics.`,
    items: o.items.map((item: any) => ({
      name: item.title,
      brand: item.brand,
      image: item.images[0],
      price: `€${Math.round(item.listing_price)}`,
      url: `https://auvra.eu/archive/${item.id}`
    }))
  };
}
