import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// High-integrity matching logic for Auvra AI Stylist
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { colors, brands, occasion, gender } = body;

    // 1. Fetch available inventory
    const { data: inventory, error } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, category, images, status')
      .eq('status', 'available')
      .limit(1000); 

    if (error || !inventory) {
      return NextResponse.json({ error: 'Inventory sync failed' }, { status: 500 });
    }

    // 2. Gender & Occasion Logic
    const isMale = (title: string) => /męski|men|guy|homme|herren/i.test(title);
    const isFemale = (title: string) => /damski|women|lady|femme|damen|girl/i.test(title);
    
    const OCCASION_KEYWORDS: Record<string, string[]> = {
      technical: ['arcteryx', 'salomon', 'patagonia', 'oakley', 'goretex', 'waterproof', 'technical', 'hiking', 'gorpcore'],
      street: ['supreme', 'stussy', 'bape', 'corteiz', 'streetwear', 'hoodie', 'cargo', 'oversized'],
      luxury: ['louis vuitton', 'chanel', 'hermes', 'prada', 'luxury', 'designer', 'archive'],
      formal: ['shirt', 'blazer', 'trousers', 'suit', 'clean', 'minimalist', 'burberry', 'ralph lauren'],
      casual: ['t-shirt', 'jeans', 'knit', 'everyday', 'relaxed']
    };

    // 3. Outfit Construction Engine
    const outfits = [];
    const usedIds = new Set();

    const CATEGORIES = {
      TOPS: ['Tops', 'Sweaters', 'Tops / Shirts', 'Knitwear / Sweaters'],
      BOTTOMS: ['Pants', 'Pants & Denim'],
      OUTERWEAR: ['Jackets', 'Jackets / Outerwear'],
      ACCESSORIES: ['Accessories', 'Bags', 'Jewelry', 'Headwear', 'Footwear']
    };

    const findItem = (categories: string[], preferredColor?: string, preferredBrands?: string[], targetGender?: 'male' | 'female', occasionText?: string) => {
      const categoryPool = inventory.filter(item => categories.includes(item.category) && !usedIds.has(item.id));

      const matches = categoryPool.filter(item => {
        let score = 0;
        const title = item.title.toLowerCase();
        
        // Brand preference
        if (preferredBrands && preferredBrands.includes(item.brand)) score += 15;
        
        // Color preference
        if (preferredColor && title.includes(preferredColor.toLowerCase())) score += 10;
        
        // Occasion Influence (Major Boost)
        if (occasionText) {
          const lowerOccasion = occasionText.toLowerCase();
          
          // Check direct keyword match in title
          if (title.includes(lowerOccasion)) score += 30;

          // Check mapped keywords
          Object.entries(OCCASION_KEYWORDS).forEach(([key, keywords]) => {
            if (lowerOccasion.includes(key)) {
              if (keywords.some(k => title.includes(k) || item.brand.toLowerCase().includes(k))) {
                score += 25;
              }
            }
          });
        }
        
        // Gender matching (Strict)
        if (targetGender === 'male') {
          if (isMale(item.title)) score += 40;
          if (isFemale(item.title)) score -= 100;
        } else if (targetGender === 'female') {
          if (isFemale(item.title)) score += 40;
          if (isMale(item.title)) score -= 100;
        }

        (item as any).tempScore = score;
        return true;
      });

      matches.sort((a, b) => (b as any).tempScore - (a as any).tempScore);
      return matches[0] || null;
    };

    const TITLES = [
      "Signature Archive Set",
      "Curated Silhouette",
      "Core Network Selection",
      "Avant-Garde Unified Protocol",
      "Essential Daily Coordinate"
    ];

    // Generate up to 5 recommendations
    const targetCount = 5;
    
    for (let i = 0; i < targetCount; i++) {
      const preferredColor = colors && colors.length > 0 ? colors[i % colors.length] : undefined;
      const preferredBrands = brands && brands.length > 0 ? brands : undefined;
      
      // Determine gender for this iteration
      let targetGender: 'male' | 'female' | undefined = gender === 'couple' ? (i % 2 === 0 ? 'male' : 'female') : (gender as any);
      
      const top = findItem(CATEGORIES.TOPS, preferredColor, preferredBrands, targetGender, occasion);
      if (top) usedIds.add(top.id);
      
      const bottom = findItem(CATEGORIES.BOTTOMS, preferredColor, preferredBrands, targetGender, occasion);
      if (bottom) usedIds.add(bottom.id);
      
      const accessory = findItem(CATEGORIES.ACCESSORIES, preferredColor, preferredBrands, targetGender, occasion);
      if (accessory) usedIds.add(accessory.id);
      
      const outerwear = findItem(CATEGORIES.OUTERWEAR, preferredColor, preferredBrands, targetGender, occasion);
      if (outerwear) usedIds.add(outerwear.id);

      const outfitItems = [top, bottom, accessory, outerwear].filter(Boolean);
      
      if (outfitItems.length >= 2) {
        outfits.push({
          outfitName: TITLES[i] || "Custom Curation",
          gender: targetGender,
          items: outfitItems.map(item => ({
            name: item!.title,
            brand: item!.brand,
            image: item!.images[0],
            color: preferredColor || "Archive Neutral",
            price: `€${Math.round(item!.listing_price)}`,
            url: `https://auvra.eu/archive/${item!.id}`
          })),
          styleReason: `A synchronized ${occasion || 'lifestyle'} selection balancing ${targetGender === 'male' ? 'masculine' : 'feminine'} ${occasion ? occasion.toLowerCase() : 'aesthetic'} nodes.`
        });
      }
    }

    // Special Couple Set Handling (Always make the first one a couple match if requested)
    if (gender === 'couple' && outfits.length >= 2) {
      const maleSet = outfits.find(o => o.gender === 'male');
      const femaleSet = outfits.find(o => o.gender === 'female');
      
      if (maleSet && femaleSet) {
        const coupleSet = {
          outfitName: "Matching Pulse Couple Set",
          isCouple: true,
          male: maleSet,
          female: femaleSet,
          styleReason: `Synchronized ${occasion || 'lifestyle'} presence for coordinated aesthetic DNA. Matching brand heritage and ${colors?.[0] || 'neutral'} tones.`
        };
        // Put the couple set at the start and keep total to 5
        return NextResponse.json([coupleSet, ...outfits.filter(o => o !== maleSet && o !== femaleSet)].slice(0, 5));
      }
    }

    return NextResponse.json(outfits.slice(0, 5));
  } catch (error) {
    console.error('Stylist Error:', error);
    return NextResponse.json({ error: 'Styling engine failure' }, { status: 500 });
  }
}
