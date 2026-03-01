/**
 * AUVRA STYLIST ENGINE v3.3 (AESTHETIC INTEGRITY UPGRADE)
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
  "Bottega Veneta": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'relaxed' },
  "Amiri": { cluster: 'luxury', formalityBias: 4, silhouetteBias: 'relaxed' },

  // Tier 2: Premium Heritage
  "Stone Island": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Burberry": { cluster: 'heritage', formalityBias: 7, silhouetteBias: 'structured' },
  "CP Company": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Ralph Lauren": { cluster: 'heritage', formalityBias: 6, silhouetteBias: 'structured' },
  "Barbour": { cluster: 'heritage', formalityBias: 5, silhouetteBias: 'structured' },

  // Tier 3: Performance / Technical
  "Arc'teryx": { cluster: 'technical', formalityBias: 3, silhouetteBias: 'technical' },
  "Salomon": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "Patagonia": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Oakley": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "The North Face": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'relaxed' },

  // Tier 4: Streetwear Heat
  "Supreme": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "A Bathing Ape": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "Stüssy": { cluster: 'street', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Corteiz": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },
  "Nike": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Adidas": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Hellstar": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },
  "Sp5der": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },
  "Denim Tears": { cluster: 'street', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Gallery Dept": { cluster: 'street', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Broken Planet": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },

  // Tier 5: Mass / Contemporary
  "Dickies": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Carhartt": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Levi's": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Levis": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Diesel": { cluster: 'workwear', formalityBias: 3, silhouetteBias: 'relaxed' },
  "Lacoste": { cluster: 'minimal', formalityBias: 4, silhouetteBias: 'relaxed' },
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
  visualRef: string;
  slots: {
    OUTERWEAR: SlotConstraints;
    TOPS: SlotConstraints;
    BOTTOMS: SlotConstraints;
    FOOTWEAR: SlotConstraints;
  };
}

const ARCHETYPE_FORMULAS: Record<string, string[]> = {
  'gorpcore-specialist': ["Arc'teryx", "Salomon", "Oakley", "The North Face", "Patagonia", "Stone Island"],
  'archive-hero': ["Supreme", "A Bathing Ape", "Stüssy", "Corteiz", "Nike", "Adidas", "Dickies", "Carhartt"],
  'quiet-luxury': ["Louis Vuitton", "Prada", "Chanel", "Hermès", "Burberry", "Ralph Lauren", "Gucci", "Moncler"]
};

export const ARCHETYPES: Archetype[] = [
  {
    id: 'gorpcore-specialist',
    name: 'The Gorpcore Specialist',
    visualRef: '/vibes/6f85c4b2f69fdb8f0f54a5cffd985ba5.jpg',
    slots: {
      OUTERWEAR: { clusters: ['technical'], silhouettes: ['technical'], maxFormalityDelta: 2, forbiddenBrands: ['Nike', 'Adidas', 'MLB'] },
      TOPS: { clusters: ['technical', 'minimal'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 2 }, 
      BOTTOMS: { clusters: ['technical'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 2 },
      FOOTWEAR: { clusters: ['technical'], silhouettes: ['technical'], maxFormalityDelta: 2 },
    }
  },
  {
    id: 'archive-hero',
    name: 'The 90s Archive Hero',
    visualRef: '/vibes/191a6aaa3f480f2ca33d814d52ff3b62.jpg',
    slots: {
      OUTERWEAR: { clusters: ['street', 'workwear'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      TOPS: { clusters: ['street', 'heritage', 'minimal'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      BOTTOMS: { clusters: ['workwear', 'street'], silhouettes: ['oversized', 'relaxed'], maxFormalityDelta: 3 },
      FOOTWEAR: { clusters: ['street', 'minimal'], silhouettes: ['relaxed'], maxFormalityDelta: 3 },
    }
  },
  {
    id: 'quiet-luxury',
    name: 'The Quiet Luxury Node',
    visualRef: '/vibes/cfd79f46ca1eb048b72ecf2cb5f2de2f.jpg',
    slots: {
      OUTERWEAR: { clusters: ['luxury', 'heritage'], silhouettes: ['structured'], maxFormalityDelta: 2 },
      TOPS: { clusters: ['luxury', 'minimal'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 2 },
      BOTTOMS: { clusters: ['luxury', 'heritage'], silhouettes: ['structured'], maxFormalityDelta: 2 },
      FOOTWEAR: { clusters: ['luxury', 'minimal'], silhouettes: ['structured'], maxFormalityDelta: 2 },
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
  layerWeight: number; 
}

export interface UserIntent {
  anchorItemId?: string | null;
  lockedItemIds?: string[];
  gender: Gender | 'couple';
  colors?: string[];
  brands?: string[];
  occasion?: string;
  seedImageIds?: string[];
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

  static getDominantCluster(intent: UserIntent): AestheticCluster {
    // 1. Occasion has highest priority
    if (intent.occasion) {
      const occ = intent.occasion.toLowerCase();
      if (occ.includes('technical') || occ.includes('hiking') || occ.includes('mountain') || occ.includes('gorp')) return 'technical';
      if (occ.includes('street') || occ.includes('skate') || occ.includes('urban')) return 'street';
      if (occ.includes('luxury') || occ.includes('gala') || occ.includes('fashion week')) return 'luxury';
      if (occ.includes('work') || occ.includes('office') || occ.includes('formal') || occ.includes('smart')) return 'heritage';
    }

    // 2. Then Brands
    if (intent.brands && intent.brands.length > 0) {
      const counts: Record<string, number> = {};
      intent.brands.forEach(b => {
        const cluster = BRAND_REGISTRY[b]?.cluster;
        if (cluster) counts[cluster] = (counts[cluster] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) return sorted[0][0] as AestheticCluster;
    }

    return 'minimal';
  }

  static generateArchetypeOutfits(inventory: EnrichedItem[], intent: UserIntent): OutfitSet[] {
    const outfits: OutfitSet[] = [];
    const anchorItem = intent.anchorItemId ? inventory.find(i => i.id === intent.anchorItemId) : null;
    const lockedItems = intent.lockedItemIds ? inventory.filter(i => intent.lockedItemIds?.includes(i.id)) : [];

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

    const dominantCluster = this.getDominantCluster(intent);

    ARCHETYPES.forEach(archetype => {
      // PRIORITY: If a dominant cluster is resolved, only look at archetypes that include that cluster in their main outerwear slot
      if (dominantCluster !== 'minimal' && !archetype.slots.OUTERWEAR.clusters.includes(dominantCluster)) {
         return;
      }

      const checkItems = anchorItem ? [anchorItem, ...lockedItems] : lockedItems;
      for (const item of checkItems) {
        const slotKey = this.getCategoryKey(item.category);
        if (!slotKey) continue;
        const constraints = archetype.slots[slotKey];
        const isCompatible = constraints.clusters.some(c => CLUSTER_COMPATIBILITY[c].includes(item.cluster));
        if (!isCompatible) return;
      }

      for (let i = 0; i < 200; i++) {
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
          
          const formulaBrands = ARCHETYPE_FORMULAS[archetype.id] || [];
          const archetypeMatchPool = pool.filter(item => formulaBrands.includes(item.brand));
          if (archetypeMatchPool.length > 0) {
            pool = archetypeMatchPool;
          }

          // OCCASION BOOST: Filter by occasion keywords if present
          if (intent.occasion) {
             const occPool = pool.filter(item => item.title.toLowerCase().includes(intent.occasion!.toLowerCase()));
             if (occPool.length > 0) pool = occPool;
          }

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

        if (items.length >= 3) {
          const formalities = items.map(it => it.formality);
          const delta = Math.max(...formalities) - Math.min(...formalities);
          
          const outerwear = items.find(it => this.getCategoryKey(it.category) === 'OUTERWEAR');
          const top = items.find(it => this.getCategoryKey(it.category) === 'TOPS');
          
          let integrityCheck = true;
          if (outerwear && top && outerwear.layerWeight < top.layerWeight) integrityCheck = false;

          if (intent.colors && intent.colors.length > 0) {
             const matchesColor = items.some(it => intent.colors?.some(c => it.title.toLowerCase().includes(c.toLowerCase())));
             if (!matchesColor) integrityCheck = false;
             score += 30;
          }

          if (integrityCheck && delta <= 5) {
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
    // Fisher-Yates in-place shuffle — O(n), unbiased.
    // Replaces the previous sort((a,b) => a.id.localeCompare(b.id)) which was
    // deterministic alphabetical order, not a shuffle at all.
    const out = array.slice(); // do not mutate the original pool array
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
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
