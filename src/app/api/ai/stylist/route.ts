import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// High-integrity matching logic for Auvra AI Stylist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { colors, brands, occasion } = body;

    // 1. Fetch available inventory
    const { data: inventory, error } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, category, images, status')
      .eq('status', 'available')
      .limit(500);

    if (error || !inventory) {
      return NextResponse.json({ error: 'Inventory sync failed' }, { status: 500 });
    }

    // 2. Outfit Construction Engine (Heuristic-based)
    const outfits = [];
    const usedIds = new Set();

    const CATEGORIES = {
      TOPS: ['Tops', 'Sweaters', 'Tops / Shirts', 'Knitwear / Sweaters'],
      BOTTOMS: ['Pants', 'Pants & Denim'],
      OUTERWEAR: ['Jackets', 'Jackets / Outerwear'],
      ACCESSORIES: ['Accessories', 'Bags', 'Jewelry', 'Headwear', 'Footwear']
    };

    const findItem = (categories: string[], preferredColor?: string, preferredBrands?: string[]) => {
      // Priority 1: Category + Brand + Color
      let match = inventory.find(item => 
        categories.includes(item.category) && 
        !usedIds.has(item.id) &&
        (preferredBrands ? preferredBrands.includes(item.brand) : true) &&
        (preferredColor ? item.title.toLowerCase().includes(preferredColor.toLowerCase()) : true)
      );

      // Priority 2: Category + Color
      if (!match) {
        match = inventory.find(item => 
          categories.includes(item.category) && 
          !usedIds.has(item.id) &&
          (preferredColor ? item.title.toLowerCase().includes(preferredColor.toLowerCase()) : true)
        );
      }

      // Priority 3: Category only
      if (!match) {
        match = inventory.find(item => categories.includes(item.category) && !usedIds.has(item.id));
      }

      return match;
    };

    const TITLES = [
      "Urban Technical Layering",
      "Archive Heritage Selection",
      "Neural Street Coordination",
      "Monochromatic Pulse Set",
      "High-Fidelity Daily Uniform"
    ];

    for (let i = 0; i < 3; i++) {
      const preferredColor = colors && colors.length > 0 ? colors[i % colors.length] : undefined;
      const preferredBrands = brands && brands.length > 0 ? brands : undefined;
      
      const top = findItem(CATEGORIES.TOPS, preferredColor, preferredBrands);
      if (top) usedIds.add(top.id);
      
      const bottom = findItem(CATEGORIES.BOTTOMS, preferredColor, preferredBrands);
      if (bottom) usedIds.add(bottom.id);
      
      const accessory = findItem(CATEGORIES.ACCESSORIES, preferredColor, preferredBrands);
      if (accessory) usedIds.add(accessory.id);
      
      const outerwear = findItem(CATEGORIES.OUTERWEAR, preferredColor, preferredBrands);
      if (outerwear) usedIds.add(outerwear.id);

      const outfitItems = [top, bottom, accessory, outerwear].filter(Boolean);
      
      if (outfitItems.length >= 2) {
        outfits.push({
          outfitName: TITLES[i] || "Custom Curation",
          items: outfitItems.map(item => ({
            name: item!.title,
            brand: item!.brand,
            color: preferredColor || "Archive Neutral",
            price: `€${Math.round(item!.listing_price)}`,
            url: `https://auvra.eu/archive/${item!.id}`
          })),
          styleReason: `A visually coherent ${occasion || 'lifestyle'} set balancing ${top?.brand || 'heritage'} textures with ${bottom?.brand || 'contemporary'} silhouettes.`
        });
      }
    }

    return NextResponse.json(outfits);
  } catch (error) {
    console.error('Stylist Error:', error);
    return NextResponse.json({ error: 'Styling engine failure' }, { status: 500 });
  }
}
