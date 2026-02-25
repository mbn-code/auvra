/**
 * AUVRA STYLIST ENGINE v2 (DETERMINISTIC)
 * Hierarchical Scoring & Guided Generation
 */

import { supabase } from "@/lib/supabase";

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
  "Louis Vuitton": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'structured' },
  "Hermès": { cluster: 'luxury', formalityBias: 9, silhouetteBias: 'structured' },
  "Chanel": { cluster: 'luxury', formalityBias: 9, silhouetteBias: 'structured' },
  "Prada": { cluster: 'luxury', formalityBias: 8, silhouetteBias: 'relaxed' },
  "Chrome Hearts": { cluster: 'luxury', formalityBias: 5, silhouetteBias: 'relaxed' },
  "Moncler": { cluster: 'luxury', formalityBias: 6, silhouetteBias: 'technical' },
  "Stone Island": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Burberry": { cluster: 'heritage', formalityBias: 7, silhouetteBias: 'structured' },
  "CP Company": { cluster: 'heritage', formalityBias: 4, silhouetteBias: 'technical' },
  "Ralph Lauren": { cluster: 'heritage', formalityBias: 6, silhouetteBias: 'structured' },
  "Arc'teryx": { cluster: 'technical', formalityBias: 3, silhouetteBias: 'technical' },
  "Salomon": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "Patagonia": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Oakley": { cluster: 'technical', formalityBias: 2, silhouetteBias: 'technical' },
  "Supreme": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "A Bathing Ape": { cluster: 'street', formalityBias: 2, silhouetteBias: 'oversized' },
  "Stüssy": { cluster: 'street', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Corteiz": { cluster: 'street', formalityBias: 1, silhouetteBias: 'oversized' },
  "Nike": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Adidas": { cluster: 'street', formalityBias: 1, silhouetteBias: 'relaxed' },
  "Dickies": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Carhartt": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Levi's": { cluster: 'workwear', formalityBias: 2, silhouetteBias: 'relaxed' },
  "Essentials": { cluster: 'minimal', formalityBias: 2, silhouetteBias: 'oversized' },
};

export const COLOR_FAMILIES: Record<string, string[]> = {
  "neutrals": ["black", "white", "grey", "charcoal", "slate", "stone", "cream", "sand", "khaki", "beige", "navy"],
  "earth": ["olive", "forest", "clay", "rust", "espresso", "brown"],
  "accents": ["red", "blue", "yellow", "pink", "purple", "orange", "electric blue"]
};

export const CLUSTER_COMPATIBILITY: Record<AestheticCluster, AestheticCluster[]> = {
  luxury: ['luxury', 'minimal', 'heritage'],
  street: ['street', 'workwear', 'minimal', 'technical'],
  technical: ['technical', 'minimal', 'street', 'heritage'], // Gorpcore mixes with street and tech-heritage
  minimal: ['minimal', 'luxury', 'street', 'technical', 'heritage', 'workwear'],
  heritage: ['heritage', 'luxury', 'minimal', 'technical'],
  workwear: ['workwear', 'street', 'minimal']
};

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
  raw: any;
}

export interface UserIntent {
  colors?: string[];
  brands?: string[];
  occasion?: string;
  gender: Gender | 'couple';
}

export interface ScoreBreakdown {
  hardFilters: boolean;
  structural: number;
  harmony: number;
  personalization: number;
  adjustments: number;
  total: number;
}

export interface OutfitSet {
  id: string;
  items: EnrichedItem[];
  score: ScoreBreakdown;
  dominantCluster: AestheticCluster;
}

// --- CONSTANTS ---

const BASE_SCORE = 100;
const WEIGHTS = {
  SAME_CLUSTER: 40,
  COMPATIBLE_CLUSTER: 20,
  SILHOUETTE_SYNC: 30,
  COLOR_MONOCHROME: 30,
  COLOR_NEUTRAL_ACCENT: 25,
  BRAND_MATCH: 25,
  COLOR_MATCH: 15,
  CLASH_PENALTY: -60,
  FORMALITY_CLASH: -40,
  COLOR_CLASH: -30
};

// --- CORE ENGINE ---

export class StylistEngine {
  
  static enrichInventory(items: any[]): EnrichedItem[] {
    return items.map(item => {
      const title = item.title.toLowerCase();
      const brand = item.brand;
      const meta = BRAND_REGISTRY[brand] || { cluster: 'minimal', formalityBias: 3, silhouetteBias: 'relaxed' };
      
      // Gender detection
      let gender: Gender = 'unisex';
      if (/męski|men|guy|homme|herren/i.test(title)) gender = 'male';
      else if (/damski|women|lady|femme|damen|girl/i.test(title)) gender = 'female';

      // Color detection
      let colorFamily = 'neutrals';
      for (const [family, keywords] of Object.entries(COLOR_FAMILIES)) {
        if (keywords.some(k => title.includes(k))) {
          colorFamily = family;
          break;
        }
      }

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
        silhouette: meta.silhouetteBias || (meta.cluster === 'technical' ? 'technical' : 'relaxed'),
        colorFamily,
        raw: item
      };
    });
  }

  static scoreOutfit(items: EnrichedItem[], intent: UserIntent): ScoreBreakdown {
    const breakdown: ScoreBreakdown = {
      hardFilters: true,
      structural: 0,
      harmony: 0,
      personalization: 0,
      adjustments: 0,
      total: 0
    };

    // --- LAYER 1: HARD FILTERS ---
    const clusters = items.map(i => i.cluster);
    const uniqueClusters = Array.from(new Set(clusters));
    const formalities = items.map(i => i.formality);
    const formalityDelta = Math.max(...formalities) - Math.min(...formalities);

    // Gender check (if intent is specific)
    if (intent.gender !== 'unisex' && intent.gender !== 'couple') {
      const clashingGender = items.some(i => i.gender !== 'unisex' && i.gender !== intent.gender);
      if (clashingGender) breakdown.hardFilters = false;
    }

    // Formality Check
    if (formalityDelta > 4) breakdown.hardFilters = false;

    // Cluster Conflict
    const hasConflict = uniqueClusters.some(c1 => 
      uniqueClusters.some(c2 => !CLUSTER_COMPATIBILITY[c1].includes(c2))
    );
    if (hasConflict) breakdown.hardFilters = false;

    if (!breakdown.hardFilters) return { ...breakdown, total: -1 };

    // --- LAYER 2: STRUCTURAL INTEGRITY ---
    if (uniqueClusters.length === 1) breakdown.structural += WEIGHTS.SAME_CLUSTER;
    else breakdown.structural += WEIGHTS.COMPATIBLE_CLUSTER;

    const silhouettes = items.map(i => i.silhouette);
    if (new Set(silhouettes).size === 1) breakdown.structural += WEIGHTS.SILHOUETTE_SYNC;

    // --- LAYER 3: HARMONY ---
    const colors = items.map(i => i.colorFamily);
    const uniqueColors = new Set(colors);
    if (uniqueColors.size === 1) breakdown.harmony += WEIGHTS.COLOR_MONOCHROME;
    else if (uniqueColors.has('neutrals') && uniqueColors.has('accents') && uniqueColors.size === 2) {
      breakdown.harmony += WEIGHTS.COLOR_NEUTRAL_ACCENT;
    }

    // --- LAYER 4: PERSONALIZATION ---
    items.forEach(item => {
      if (intent.brands?.includes(item.brand)) breakdown.personalization += WEIGHTS.BRAND_MATCH;
      const itemTitle = item.title.toLowerCase();
      if (intent.colors?.some(c => itemTitle.includes(c.toLowerCase()))) {
        breakdown.personalization += WEIGHTS.COLOR_MATCH;
      }
    });

    // --- LAYER 5: MICRO-ADJUSTMENTS ---
    const uniqueBrands = new Set(items.map(i => i.brand));
    if (uniqueBrands.size < items.length && items[0].cluster !== 'luxury') {
      breakdown.adjustments -= 20; // Penalize brand repetition unless luxury uniform
    }

    breakdown.total = BASE_SCORE + breakdown.structural + breakdown.harmony + breakdown.personalization + breakdown.adjustments;
    return breakdown;
  }

  static getDominantCluster(intent: UserIntent): AestheticCluster {
    if (intent.brands && intent.brands.length > 0) {
      const counts: Record<string, number> = {};
      intent.brands.forEach(b => {
        const cluster = BRAND_REGISTRY[b]?.cluster;
        if (cluster) counts[cluster] = (counts[cluster] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) return sorted[0][0] as AestheticCluster;
    }

    if (intent.occasion) {
      const occ = intent.occasion.toLowerCase();
      if (occ.includes('technical') || occ.includes('hiking') || occ.includes('mountain')) return 'technical';
      if (occ.includes('street') || occ.includes('skate') || occ.includes('urban')) return 'street';
      if (occ.includes('luxury') || occ.includes('gala') || occ.includes('fashion week')) return 'luxury';
      if (occ.includes('work') || occ.includes('office') || occ.includes('formal')) return 'heritage';
    }

    return 'minimal';
  }

  static generateGuidedOutfits(inventory: EnrichedItem[], intent: UserIntent, count = 50): OutfitSet[] {
    const outfits: OutfitSet[] = [];
    const pools: Record<string, EnrichedItem[]> = {
      OUTERWEAR: inventory.filter(i => i.category.toLowerCase().includes('jacket') || i.category.toLowerCase().includes('outerwear')),
      TOPS: inventory.filter(i => i.category.toLowerCase().includes('shirt') || i.category.toLowerCase().includes('top') || i.category.toLowerCase().includes('sweater')),
      BOTTOMS: inventory.filter(i => i.category.toLowerCase().includes('pant') || i.category.toLowerCase().includes('denim')),
      FOOTWEAR: inventory.filter(i => i.category.toLowerCase().includes('footwear') || i.category.toLowerCase().includes('shoe'))
    };

    const dominantCluster = this.getDominantCluster(intent);
    const categoryKeys = ['OUTERWEAR', 'TOPS', 'BOTTOMS', 'FOOTWEAR'];
    
    for (let attempt = 0; attempt < 200; attempt++) {
      const items: EnrichedItem[] = [];
      
      categoryKeys.forEach((cat, idx) => {
        const pool = pools[cat];
        if (!pool || pool.length === 0) return;

        const clusterPool = pool.filter(i => i.cluster === dominantCluster);
        const compatPool = pool.filter(i => CLUSTER_COMPATIBILITY[dominantCluster].includes(i.cluster));
        const finalPool = clusterPool.length > 0 ? clusterPool : (compatPool.length > 0 ? compatPool : pool);
        
        const itemIndex = (attempt * 17 + idx * 31) % finalPool.length;
        items.push(finalPool[itemIndex]);
      });

      if (items.length >= 3) {
        const score = this.scoreOutfit(items, intent);
        if (score.hardFilters) {
          outfits.push({
            id: items.map(i => i.id).join('-'),
            items,
            score,
            dominantCluster
          });
        }
      }
    }

    // Filter duplicates
    const unique = new Map<string, OutfitSet>();
    outfits.forEach(o => {
      const key = o.items.map(i => i.id).sort().join('|');
      if (!unique.has(key)) unique.set(key, o);
    });

    return Array.from(unique.values()).sort((a, b) => b.score.total - a.score.total);
  }

  static diversityFilter(outfits: OutfitSet[], targetCount = 5): OutfitSet[] {
    const selected: OutfitSet[] = [];
    
    for (const outfit of outfits) {
      if (selected.length >= targetCount) break;

      const tooSimilar = selected.some(s => {
        const overlap = outfit.items.filter(item => s.items.some(si => si.id === item.id)).length;
        return (overlap / outfit.items.length) > 0.7;
      });

      if (!tooSimilar) selected.push(outfit);
    }

    return selected;
  }

  static coordinationScore(m: OutfitSet, f: OutfitSet): number {
    let score = 0;
    if (m.dominantCluster === f.dominantCluster) score += 50;
    
    const mFormality = m.items[0].formality;
    const fFormality = f.items[0].formality;
    if (Math.abs(mFormality - fFormality) <= 2) score += 30;

    const mColors = new Set(m.items.map(i => i.colorFamily));
    const fColors = new Set(f.items.map(i => i.colorFamily));
    const sharedColors = Array.from(mColors).filter(c => fColors.has(c));
    if (sharedColors.length > 0) score += 20;

    // Conflict
    if (!CLUSTER_COMPATIBILITY[m.dominantCluster].includes(f.dominantCluster)) score -= 40;

    return score;
  }
}
