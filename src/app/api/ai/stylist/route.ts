import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StylistEngine, UserIntent, OutfitSet } from '@/lib/stylist-engine';

/**
 * AUVRA STYLIST API v3.0
 * Archetype-Driven Constraint Satisfaction
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { anchorItemId, lockedItemIds, gender, colors, brands, occasion } = body;

    const intent: UserIntent = {
      anchorItemId,
      lockedItemIds,
      gender: gender === 'couple' ? 'couple' : (gender || 'unisex'),
      colors,
      brands,
      occasion
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

      const maleOutfits = StylistEngine.generateArchetypeOutfits(maleInventory, { ...intent, gender: 'male' });
      const femaleOutfits = StylistEngine.generateArchetypeOutfits(femaleInventory, { ...intent, gender: 'female' });

      const couples = [];
      // Synchronize by Archetype
      for (const m of maleOutfits) {
        for (const f of femaleOutfits) {
          if (couples.length >= 5) break;
          
          if (StylistEngine.coordinationScore(m, f) >= 100) {
            couples.push({
              outfitName: `Synchronized ${m.outfitName} Couple Set`,
              isCouple: true,
              male: formatOutfit(m),
              female: formatOutfit(f),
              styleReason: `Twin-node coordination using the ${m.outfitName} blueprint. Matching silhouette and cluster DNA.`
            });
          }
        }
      }
      return NextResponse.json(couples);
    }

    // 3. STANDARD SINGLE PROTOCOL
    const outfits = StylistEngine.generateArchetypeOutfits(inventory, intent);

    // 4. FORMATTING
    const result = outfits.map(o => formatOutfit(o));

    return NextResponse.json(result);

  } catch (error) {
    console.error('Stylist Error:', error);
    return NextResponse.json({ error: 'Styling engine failure' }, { status: 500 });
  }
}

/**
 * Standardizes outfit JSON structure and enforces item category ordering.
 */
function formatOutfit(o: OutfitSet) {
  const items = [...o.items].sort((a, b) => {
    const getOrder = (cat: string) => {
      const c = cat.toLowerCase();
      if (c.includes('jacket') || c.includes('outerwear')) return 1;
      if (c.includes('shirt') || c.includes('top') || c.includes('sweater') || c.includes('knit')) return 2;
      if (c.includes('pant') || c.includes('denim')) return 3;
      if (c.includes('footwear') || c.includes('shoe')) return 4;
      return 5;
    };
    return getOrder(a.category) - getOrder(b.category);
  });

  return {
    outfitName: o.outfitName,
    styleReason: o.styleReason,
    items: items.map((item) => ({
      name: item.title,
      brand: item.brand,
      image: item.images[0],
      price: `€${Math.round(item.listing_price)}`,
      url: `https://auvra.eu/archive/${item.id}`,
      id: item.id
    }))
  };
}
