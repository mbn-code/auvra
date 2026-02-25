/**
 * AUVRA STYLIST ENGINE v3.2 (AESTHETIC INTEGRITY UPGRADE)
 * Constraint-Satisfaction & Layering Logic
 */

// --- TYPES & REGISTRIES ---

export type AestheticCluster = 'luxury' | 'street' | 'technical' | 'minimal' | 'heritage' | 'workwear';
export type Silhouette = 'structured' | 'relaxed' | 'oversized' | 'technical';
export type Gender = 'male' | 'female' | 'unisex';

export interface BrandMeta {
  cluster: AestheticCluster;
  formalityBias: number; // 0-10
  silhouetteBias?: Silhouette;
}

export const BRAND_REGISTRY: Record<string, BrandMeta> = {
  // Tier 1: Ultra Luxury
  "Louis Vuitton": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'structured' },
  "Hermès": { cluster: 'luxury', formalityBias: 9, silhouetteBias: 'structured' },
  "Chanel": { cluster: 'luxury', formalityBias: 9, silhouetteBias: 'structured' },
  "Prada": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'relaxed' },
  "Chrome Hearts": { cluster: 'luxury', formalityBias: 5, silhouetteBias: 'relaxed' },
  "Moncler": { cluster: 'luxury', formalityBias: 6, silhouetteBias: 'technical' },
  "Gucci": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'relaxed' },
  "Stone Island": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Burberry": { cluster: 'heritage', formalityBias: 7, silhouetteBias: 'structured' },
  "CP Company": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Ralph Lauren": { cluster: 'heritage', formalityBias: 6, silhouetteBias: 'structured' },
  "Arc'teryx": { cluster: 'technical', formalityBias: 3, silhouetteBias: 'technical' },
  "Salomon": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "Patagonia": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Oakley": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "The North Face": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Supreme": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "A Bathing Ape": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "Stüssy": { cluster: 'street', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Corteiz": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },
  "Nike": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Adidas": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Dickies": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Carhartt": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Essentials": { cluster: 'minimal', formalityBias: 2, silhouetteBias: 'oversized' },
  "New Balance": { cluster: 'minimal', formalityBias: 2, silhouetteBias: 'relaxed' },
  "ASICS": { cluster: 'minimal', formalityBias: 2, silhouetteBias: 'relaxed' },
};

export const COLOR_FAMILIES: Record<string, string[]> = {
  "neutrals": ["black", "white", "grey", "charcoal", "slate", "stone", "cream", "sand", "khaki", "beige", "navy"],
  "earth": ["olive", "forest", "clay", "rust", "espresso", "brown"],
  "accents": ["red", "blue", "yellow", "pink", "purple", "orange", "electric blue"]
};

export const CLUSTER_COMPATIBILITY: Record<AestheticCluster, AestheticCluster[]> = {
  luxury: ['luxury', 'minimal', 'heritage'],
  street: ['street', 'workwear', 'minimal'],
  technical: ['technical', 'minimal', 'heritage'], 
  minimal: ['minimal', 'luxury', 'street', 'technical', 'heritage', 'workwear'],
  heritage: ['heritage', 'luxury', 'minimal', 'technical'],
  workwear: ['workwear', 'street', 'minimal']
};

export interface SlotConstraints {
  clusters: AestheticCluster[];
  silhouettes: Silhouette[];
  maxFormalityDelta: number;
  forbiddenBrands?: string[];
}

export interface Archetype {
  id: string;
  name: string;
  slots: {
    OUTERWEAR: SlotConstraints;
    TOPS: SlotConstraints;
    BOTTOMS: SlotConstraints;
    FOOTWEAR: SlotConstraints;
  };
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'gorpcore-specialist',
    name: 'The Gorpcore Specialist',
    slots: {
      OUTERWEAR: { clusters: ['technical'], silhouettes: ['technical'], maxFormalityDelta: 2, forbiddenBrands: ['Nike', 'Adidas', 'MLB'] },
      TOPS: { clusters: ['technical', 'minimal', 'heritage'], silhouettes: ['relaxed', 'technical'], maxFormalityDelta: 2 }, 
      BOTTOMS: { clusters: ['technical', 'workwear'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 2 },
      FOOTWEAR: { clusters: ['technical', 'minimal'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 2 },
    }
  },
  {
    id: 'archive-hero',
    name: 'The 90s Archive Hero',
    slots: {
      OUTERWEAR: { clusters: ['street', 'workwear', 'heritage'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      TOPS: { clusters: ['street', 'heritage', 'minimal'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      BOTTOMS: { clusters: ['workwear', 'street', 'heritage'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      FOOTWEAR: { clusters: ['street', 'minimal'], silhouettes: ['relaxed'], maxFormalityDelta: 3 },
    }
  },
  {
    id: 'quiet-luxury',
    name: 'The Quiet Luxury Node',
    slots: {
      OUTERWEAR: { clusters: ['luxury', 'heritage'], silhouettes: ['structured'], maxFormalityDelta: 2 },
      TOPS: { clusters: ['luxury', 'minimal', 'heritage'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 2 },
      BOTTOMS: { clusters: ['luxury', 'heritage', 'minimal'], silhouettes: ['structured'], maxFormalityDelta: 2 },
      FOOTWEAR: { clusters: ['luxury', 'minimal', 'heritage'], silhouettes: ['structured'], maxFormalityDelta: 2 },
    }
  }
];

export interface EnrichedItem {
  id: string;
  title: string;
  brand: string;
  listing_price: number;
  category: string;
  images: string[];
  gender: Gender;
  cluster: AestheticCluster;
  formality: number;
  silhouette: Silhouette;
  colorFamily: string;
  isPolluted: boolean;
  layerWeight: number; // 3: Heavy Outerwear, 2: Mid (Hoodie/Sweater), 1: Light (Tee/Shirt)
}

export interface UserIntent {
  anchorItemId?: string | null;
  lockedItemIds?: string[];
  gender: Gender | 'couple';
  colors?: string[];
  brands?: string[];
  occasion?: string;
}

export interface OutfitSet {
  archetypeId: string;
  outfitName: string;
  items: EnrichedItem[];
  styleReason: string;
  score: number;
}

export class StylistEngine {
  
  static enrichInventory(items: any[]): EnrichedItem[] {
    return items.map(item => {
      const title = item.title.toLowerCase();
      const brand = item.brand;
      const meta = BRAND_REGISTRY[brand] || { cluster: 'minimal', formalityBias: 3, silhouetteBias: 'relaxed' };
      
      // Data Pollution Check
      const otherBrands = Object.keys(BRAND_REGISTRY).filter(b => b !== brand && b.length > 3);
      const isPolluted = otherBrands.some(ob => title.includes(ob.toLowerCase()));

      let gender: Gender = 'unisex';
      if (/męski|men|guy|homme|herren/i.test(title)) gender = 'male';
      else if (/damski|women|lady|femme|damen|girl/i.test(title)) gender = 'female';

      let colorFamily = 'neutrals';
      for (const [family, keywords] of Object.entries(COLOR_FAMILIES)) {
        if (keywords.some(k => title.includes(k))) {
          colorFamily = family;
          break;
        }
      }

      // Determine Layer Weight
      let layerWeight = 1;
      const cat = item.category.toLowerCase();
      if (cat.includes('jacket') || cat.includes('outerwear')) layerWeight = 3;
      else if (cat.includes('sweater') || cat.includes('knit') || title.includes('hoodie') || title.includes('fleece')) layerWeight = 2;

      return {
        id: item.id,
        title: item.title,
        brand: item.brand,
        listing_price: item.listing_price,
        category: item.category,
        images: item.images,
        gender,
        cluster: isPolluted ? 'minimal' : meta.cluster,
        formality: meta.formalityBias,
        silhouette: meta.silhouetteBias || (meta.cluster === 'technical' ? 'technical' : 'relaxed'),
        colorFamily,
        isPolluted,
        layerWeight
      };
    });
  }

  static getCategoryKey(category: string): keyof Archetype['slots'] | null {
    const c = category.toLowerCase();
    if (c.includes('jacket') || c.includes('outerwear')) return 'OUTERWEAR';
    if (c.includes('shirt') || c.includes('top') || c.includes('sweater') || c.includes('knit') || c.includes('hoodie')) return 'TOPS';
    if (c.includes('pant') || c.includes('denim') || c.includes('jeans') || c.includes('cargo') || c.includes('trousers')) return 'BOTTOMS';
    if (c.includes('footwear') || c.includes('shoe') || c.includes('sneaker')) return 'FOOTWEAR';
    return null;
  }

  static isItemValidForSlot(item: EnrichedItem, constraints: SlotConstraints, relaxed = false): boolean {
    if (item.isPolluted && !relaxed) return false;
    if (constraints.forbiddenBrands?.includes(item.brand)) return false;
    if (relaxed) return constraints.clusters.includes(item.cluster);
    return constraints.clusters.includes(item.cluster) && constraints.silhouettes.includes(item.silhouette);
  }

  static generateArchetypeOutfits(inventory: EnrichedItem[], intent: UserIntent): OutfitSet[] {
    const outfits: OutfitSet[] = [];
    const anchorItem = intent.anchorItemId ? inventory.find(i => i.id === intent.anchorItemId) : null;
    const lockedItems = intent.lockedItemIds ? inventory.filter(i => intent.lockedItemIds?.includes(i.id)) : [];

    // Filter inventory by gender and PRICE FLOOR (>= 100 euro for stylist)
    const filteredPool = inventory.filter(i => {
      if (i.listing_price < 100) return false;
      if (intent.gender === 'unisex' || intent.gender === 'couple') return true;
      return i.gender === 'unisex' || i.gender === intent.gender;
    });

    const pools = {
      OUTERWEAR: this.shuffle(filteredPool.filter(i => this.getCategoryKey(i.category) === 'OUTERWEAR')),
      TOPS: this.shuffle(filteredPool.filter(i => this.getCategoryKey(i.category) === 'TOPS')),
      BOTTOMS: this.shuffle(filteredPool.filter(i => this.getCategoryKey(i.category) === 'BOTTOMS')),
      FOOTWEAR: this.shuffle(filteredPool.filter(i => this.getCategoryKey(i.category) === 'FOOTWEAR')),
    };

    ARCHETYPES.forEach(archetype => {
      const checkItems = anchorItem ? [anchorItem, ...lockedItems] : lockedItems;
      for (const item of checkItems) {
        const slotKey = this.getCategoryKey(item.category);
        if (!slotKey) continue;
        const constraints = archetype.slots[slotKey];
        const isCompatible = constraints.clusters.some(c => CLUSTER_COMPATIBILITY[c].includes(item.cluster));
        if (!isCompatible) return;
      }

      for (let i = 0; i < 300; i++) {
        const items: EnrichedItem[] = [];
        let substitutedBrands: string[] = [];
        let score = 100;

        for (const [slot, constraints] of Object.entries(archetype.slots)) {
          const slotKey = slot as keyof typeof pools;
          const preselected = lockedItems.find(li => this.getCategoryKey(li.category) === slotKey) || 
                             (anchorItem && this.getCategoryKey(anchorItem.category) === slotKey ? anchorItem : null);
          
          if (preselected) {
            items.push(preselected);
            continue;
          }

          let pool = pools[slotKey].filter(item => this.isItemValidForSlot(item, constraints));
          
          if (intent.brands && intent.brands.length > 0) {
            const brandPool = pool.filter(item => intent.brands?.includes(item.brand));
            if (brandPool.length > 0) {
              pool = brandPool;
              score += 50;
            } else {
              substitutedBrands.push(slotKey.toLowerCase());
              score -= 20;
            }
          }

          if (pool.length === 0) pool = pools[slotKey].filter(item => this.isItemValidForSlot(item, constraints, true));
          if (pool.length === 0) continue;

          const itemIndex = (i * 17 + Object.keys(pools).indexOf(slotKey) * 23) % pool.length;
          items.push(pool[itemIndex]);
        }

        // Integrity Checks
        if (items.length >= 3) {
          const formalities = items.map(it => it.formality);
          const delta = Math.max(...formalities) - Math.min(...formalities);
          
          // Layering Logic: Outerwear >= Top Weight
          const outerwear = items.find(it => this.getCategoryKey(it.category) === 'OUTERWEAR');
          const top = items.find(it => this.getCategoryKey(it.category) === 'TOPS');
          if (outerwear && top && outerwear.layerWeight < top.layerWeight) continue;

          // Color family consistency if intent colors provided
          if (intent.colors && intent.colors.length > 0) {
             const matchesColor = items.some(it => intent.colors?.some(c => it.title.toLowerCase().includes(c.toLowerCase())));
             if (!matchesColor) continue;
             score += 30;
          }

          if (delta <= 5) {
            outfits.push({
              archetypeId: archetype.id,
              outfitName: archetype.name,
              items,
              styleReason: this.generateReason(items, archetype, substitutedBrands),
              score
            });
          }
        }
      }
    });

    const unique = new Map<string, OutfitSet>();
    outfits.forEach(o => {
      const key = o.items.map(it => it.id).sort().join('|');
      if (!unique.has(key)) unique.set(key, o);
    });

    return Array.from(unique.values()).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private static shuffle<T>(array: T[]): T[] {
    return array.sort((a: any, b: any) => a.id.localeCompare(b.id));
  }

  private static generateReason(items: EnrichedItem[], archetype: Archetype, substitutions: string[] = []): string {
    const primaryBrand = items[0].brand;
    let reason = `A precision-engineered ${archetype.name} coordination, anchored by ${primaryBrand} heritage and silhouette-synchronized layers.`;
    
    if (substitutions.length > 0) {
      reason += ` Note: Preferred brand nodes for ${substitutions.join(', ')} are currently depleted; high-integrity alternatives substituted to maintain Aura.`;
    }

    return reason;
  }

  static coordinationScore(m: OutfitSet, f: OutfitSet): number {
    return m.archetypeId === f.archetypeId ? 100 : 0;
  }
}
