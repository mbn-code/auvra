/**
 * AUVRA STYLIST ENGINE v3.1 (PRODUCTION READY)
 * Constraint-Satisfaction & Anchor-First Generation
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

export const CLUSTER_COMPATIBILITY: Record<AestheticCluster, AestheticCluster[]> = {
  luxury: ['luxury', 'minimal', 'heritage'],
  street: ['street', 'workwear', 'minimal', 'technical'],
  technical: ['technical', 'minimal', 'street', 'heritage'],
  minimal: ['minimal', 'luxury', 'street', 'technical', 'heritage', 'workwear'],
  heritage: ['heritage', 'luxury', 'minimal', 'technical'],
  workwear: ['workwear', 'street', 'minimal']
};

export interface SlotConstraints {
  clusters: AestheticCluster[];
  silhouettes: Silhouette[];
  maxFormalityDelta: number;
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
      OUTERWEAR: { clusters: ['technical'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 3 },
      TOPS: { clusters: ['technical', 'minimal', 'street'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 3 },
      BOTTOMS: { clusters: ['technical', 'workwear'], silhouettes: ['technical', 'relaxed'], maxFormalityDelta: 3 },
      FOOTWEAR: { clusters: ['technical'], silhouettes: ['technical'], maxFormalityDelta: 3 },
    }
  },
  {
    id: 'archive-hero',
    name: 'The 90s Archive Hero',
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
    slots: {
      OUTERWEAR: { clusters: ['luxury', 'heritage', 'minimal'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 2 },
      TOPS: { clusters: ['luxury', 'heritage', 'minimal'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 2 },
      BOTTOMS: { clusters: ['luxury', 'heritage', 'minimal'], silhouettes: ['structured'], maxFormalityDelta: 2 },
      FOOTWEAR: { clusters: ['luxury', 'heritage', 'minimal'], silhouettes: ['structured'], maxFormalityDelta: 2 },
    }
  },
  {
    id: 'dark-wear',
    name: 'Dark Wear / Chrome',
    slots: {
      OUTERWEAR: { clusters: ['luxury', 'street'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 4 },
      TOPS: { clusters: ['luxury', 'minimal', 'street'], silhouettes: ['relaxed', 'oversized'], maxFormalityDelta: 4 },
      BOTTOMS: { clusters: ['luxury', 'workwear', 'street'], silhouettes: ['relaxed', 'structured'], maxFormalityDelta: 4 },
      FOOTWEAR: { clusters: ['luxury', 'street'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 4 },
    }
  },
  {
    id: 'heritage-classic',
    name: 'Heritage Classic',
    slots: {
      OUTERWEAR: { clusters: ['heritage', 'minimal'], silhouettes: ['structured'], maxFormalityDelta: 3 },
      TOPS: { clusters: ['heritage', 'minimal'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 3 },
      BOTTOMS: { clusters: ['heritage', 'workwear'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 3 },
      FOOTWEAR: { clusters: ['heritage', 'minimal'], silhouettes: ['structured', 'relaxed'], maxFormalityDelta: 3 },
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
}

export interface UserIntent {
  anchorItemId?: string | null;
  lockedItemIds?: string[];
  gender: Gender | 'couple';
}

export interface OutfitSet {
  archetypeId: string;
  outfitName: string;
  items: EnrichedItem[];
  styleReason: string;
}

export class StylistEngine {
  
  static enrichInventory(items: any[]): EnrichedItem[] {
    return items.map(item => {
      const title = item.title.toLowerCase();
      const brand = item.brand;
      const meta = BRAND_REGISTRY[brand] || { cluster: 'minimal', formalityBias: 3, silhouetteBias: 'relaxed' };
      
      let gender: Gender = 'unisex';
      if (/męski|men|guy|homme|herren/i.test(title)) gender = 'male';
      else if (/damski|women|lady|femme|damen|girl/i.test(title)) gender = 'female';

      return {
        id: item.id,
        title: item.title,
        brand: item.brand,
        listing_price: item.listing_price,
        category: item.category,
        images: item.images,
        gender,
        cluster: meta.cluster,
        formality: meta.formalityBias,
        silhouette: meta.silhouetteBias || (meta.cluster === 'technical' ? 'technical' : 'relaxed')
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
    if (relaxed) return constraints.clusters.includes(item.cluster);
    return constraints.clusters.includes(item.cluster) && constraints.silhouettes.includes(item.silhouette);
  }

  static generateArchetypeOutfits(inventory: EnrichedItem[], intent: UserIntent): OutfitSet[] {
    const outfits: OutfitSet[] = [];
    const anchorItem = intent.anchorItemId ? inventory.find(i => i.id === intent.anchorItemId) : null;
    const lockedItems = intent.lockedItemIds ? inventory.filter(i => intent.lockedItemIds?.includes(i.id)) : [];

    const genderPool = inventory.filter(i => {
      if (intent.gender === 'unisex' || intent.gender === 'couple') return true;
      return i.gender === 'unisex' || i.gender === intent.gender;
    });

    const pools = {
      OUTERWEAR: this.shuffle(genderPool.filter(i => this.getCategoryKey(i.category) === 'OUTERWEAR')),
      TOPS: this.shuffle(genderPool.filter(i => this.getCategoryKey(i.category) === 'TOPS')),
      BOTTOMS: this.shuffle(genderPool.filter(i => this.getCategoryKey(i.category) === 'BOTTOMS')),
      FOOTWEAR: this.shuffle(genderPool.filter(i => this.getCategoryKey(i.category) === 'FOOTWEAR')),
    };

    ARCHETYPES.forEach(archetype => {
      // Anchor/Lock compatibility check - EVEN MORE RELAXED
      const checkItems = anchorItem ? [anchorItem, ...lockedItems] : lockedItems;
      for (const item of checkItems) {
        const slotKey = this.getCategoryKey(item.category);
        if (!slotKey) continue;
        const constraints = archetype.slots[slotKey];
        // We allow the item if it's in a compatible cluster for ANY of the archetype's slots
        // This makes sure we don't skip an archetype just because one locked item is slightly "off"
        const isBroadlyCompatible = Object.values(archetype.slots).some(s => 
          s.clusters.some(c => CLUSTER_COMPATIBILITY[c].includes(item.cluster))
        );
        if (!isBroadlyCompatible) return;
      }

      for (let i = 0; i < 200; i++) {
        const items: EnrichedItem[] = [];
        for (const [slot, constraints] of Object.entries(archetype.slots)) {
          const slotKey = slot as keyof typeof pools;
          const preselected = lockedItems.find(li => this.getCategoryKey(li.category) === slotKey) || 
                             (anchorItem && this.getCategoryKey(anchorItem.category) === slotKey ? anchorItem : null);
          
          if (preselected) {
            items.push(preselected);
            continue;
          }

          let pool = pools[slotKey].filter(item => this.isItemValidForSlot(item, constraints));
          if (pool.length === 0) pool = pools[slotKey].filter(item => this.isItemValidForSlot(item, constraints, true));
          
          // FINAL FALLBACK: If still empty, just take anything from the pool that isn't hard-clashing
          if (pool.length === 0) {
             pool = pools[slotKey].filter(item => {
                return constraints.clusters.some(c => CLUSTER_COMPATIBILITY[c].includes(item.cluster));
             });
          }

          if (pool.length === 0) continue;

          const itemIndex = (i * 17 + Object.keys(pools).indexOf(slotKey) * 23) % pool.length;
          items.push(pool[itemIndex]);
        }

        if (items.length >= 2) { // Relaxed to 2 items for even more density
          const formalities = items.map(it => it.formality);
          const delta = Math.max(...formalities) - Math.min(...formalities);
          
          if (delta <= 6) { // Increased allowed delta to 6
            outfits.push({
              archetypeId: archetype.id,
              outfitName: archetype.name,
              items,
              styleReason: this.generateReason(items, archetype)
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

    return Array.from(unique.values()).sort((a, b) => b.items.length - a.items.length).slice(0, 5);
  }

  private static shuffle<T>(array: T[]): T[] {
    return array.sort((a: any, b: any) => a.id.localeCompare(b.id));
  }

  private static generateReason(items: EnrichedItem[], archetype: Archetype): string {
    const primaryBrand = items[0].brand;
    return `A precision-engineered ${archetype.name} coordination, anchored by ${primaryBrand} heritage and silhouette-synchronized layers.`;
  }

  static coordinationScore(m: OutfitSet, f: OutfitSet): number {
    return m.archetypeId === f.archetypeId ? 100 : 0;
  }
}
