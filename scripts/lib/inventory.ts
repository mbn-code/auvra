import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ScrapedItem {
  source_id: string;
  title: string;
  source_url: string;
  source_price: number; // In source currency
  currency: string; // 'EUR', 'USD', 'DKK', etc.
  image: string;
  brand: string;
  condition: string;
  seller_rating?: number;
  seller_reviews?: number;
  locale?: string; // Optional if currency provided
  platform: 'vinted' | 'grailed' | 'aliexpress';
}

const luxuryBrands = ["Louis Vuitton", "Hermès", "Chanel", "Chrome Hearts", "Prada"];
const highRiskFakes = ["Essentials", "Corteiz", "Hellstar", "Sp5der", "Jordan", "Nike", "Yeezy"];
const autoApproveBrands = ["Ralph Lauren", "Carhartt", "ASICS", "Lacoste", "Supreme", "The North Face", "Arc'teryx", "Patagonia", "New Balance", "Salomon", "Oakley", "Dickies", "Diesel", "Levis", "Adidas", "Nike"];

const NON_CLOTHING_KEYWORDS = [
  "pioneer", "dj", "controller", "audio", "speaker", "sound", "headphone", 
  "console", "xbox", "playstation", "nintendo", "camera", "lens", 
  "furniture", "chair", "table", "lamp", "rug", "carpet", 
  "funko", "lego", "toy", "plush", "poster", "art", "print"
];

const PROOF_KEYWORDS = ["receipt", "kvittering", "invoice", "faktura", "rechnung", "bought from", "købt i", "authenticity", "authentic", "ægte", "original"];

const TRANSLATIONS: Record<string, string> = {
  "jakke": "Jacket", "jacka": "Jacket", "jacke": "Jacket", "kurtka": "Jacket",
  "bukser": "Pants", "byxor": "Pants", "hose": "Pants", "spodnie": "Pants",
  "skjorte": "Shirt", "skjorta": "Shirt", "hemd": "Shirt", "koszula": "Shirt", "koszulowa": "Shirt",
  "hue": "Beanie", "mössa": "Beanie", "mütze": "Beanie", "czapka": "Beanie",
  "strik": "Knit", "stickad": "Knit", "strick": "Knit", "dzianina": "Knit",
  "trøje": "Sweater", "tröja": "Sweater", "pullover": "Sweater", "sweter": "Sweater",
  "frakke": "Coat", "kappa": "Coat", "mantel": "Coat", "płaszcz": "Coat",
  "vest": "Vest", "väst": "Vest", "kamizelka": "Vest",
  "hættetrøje": "Hoodie", "huvtröja": "Hoodie", "kapuzenpullover": "Hoodie", "bluza": "Hoodie",
  "taske": "Bag", "väska": "Bag", "tasche": "Bag", "torebka": "Bag",
  "sko": "Shoes", "skor": "Shoes", "schuhe": "Shoes", "buty": "Shoes",
  "støvler": "Boots", "stiefel": "Boots",
  "bomuld": "Cotton", "baumwolle": "Cotton", "bawełna": "Cotton", "bomull": "Cotton",
  "sort": "Black", "schwarz": "Black", "czarny": "Black", "svart": "Black",
  "hvid": "White", "weiss": "White", "weiß": "White", "biały": "White", "vit": "White",
  "blå": "Blue", "blau": "Blue", "niebieski": "Blue",
  "rød": "Red", "rot": "Red", "czerwony": "Red", "röd": "Red",
  "grøn": "Green", "grün": "Green", "zielony": "Green", "grön": "Green",
  "gul": "Yellow", "gelb": "Yellow", "żółty": "Yellow",
  "meget god": "Very Good", "sehr gut": "Very Good", "bardzo dobry": "Very Good", "mycket bra": "Very Good",
  "ny uden prislapp": "New without tags", "neu ohne etikett": "New without tags", "nowy bez metki": "New without tags",
  "god": "Good", "gut": "Good", "dobry": "Good", "bra": "Good",
  "ny med prislapp": "New with tags", "neu mit etikett": "New with tags", "nowy z metką": "New with tags",
  "tilfredsstillende": "Satisfactory", "zufriedenstellend": "Satisfactory", "satysfakcjonujący": "Satisfactory", "okej": "Satisfactory"
};

const CONVERSION_RATES: Record<string, number> = {
  "dk": 0.13, "pl": 0.23, "de": 1.0, "fi": 1.0, "se": 0.088, "fr": 1.0,
  "USD": 0.92, "GBP": 1.17 
};

export function parseVintedPrice(priceText: string): number {
  if (!priceText) return 0;
  let clean = priceText.replace(/\s/g, '').replace(/[^\d,.]/g, '');
  if (clean.includes(',') && clean.includes('.')) {
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    if (lastComma > lastDot) clean = clean.replace(/\./g, '').replace(',', '.');
    else clean = clean.replace(/,/g, '');
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts[parts.length - 1].length <= 2) clean = clean.replace(/,/g, '.');
    else clean = clean.replace(/,/g, '');
  } else if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts[parts.length - 1].length > 2) clean = clean.replace(/\./g, '');
  }
  return parseFloat(clean) || 0;
}

export function convertToEUR(price: number, currencyOrLocale: string): number {
  if (currencyOrLocale === 'EUR') return price;
  const rate = CONVERSION_RATES[currencyOrLocale] || 1;
  return price * rate;
}

export function translateTerm(text: string): string {
  if (!text) return text;
  const lower = text.toLowerCase().trim();
  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];
  const words = lower.split(' ');
  const translatedWords = words.map(w => TRANSLATIONS[w] || w);
  const fullTranslated = translatedWords.join(' ');
  return fullTranslated.charAt(0).toUpperCase() + fullTranslated.slice(1).toLowerCase();
}

export function sanitizeTitle(rawTitle: string): string {
  let clean = rawTitle.split(',')[0].split(' – ')[0].split(' - ')[0].split(' | ')[0];
  clean = clean.replace(/vinted/gi, '').replace(/sold/gi, '').replace(/buying/gi, '').replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  return clean.split(' ').map(word => translateTerm(word)).join(' ');
}

export function calculateListingPrice(sourcePriceEUR: number, brand: string) {
  const logisticsBuffer = 20;
  let margin = 1.6;
  if (sourcePriceEUR > 50) margin = 1.5;
  if (sourcePriceEUR > 150) margin = 1.4;
  if (sourcePriceEUR > 300) margin = 1.35;
  if (sourcePriceEUR > 600) margin = 1.25;
  if (sourcePriceEUR > 1200) margin = 1.2;

  const highDemand = ["Chrome Hearts", "Corteiz", "Arc'teryx", "Louis Vuitton", "Prada"];
  if (highDemand.includes(brand)) margin += 0.1;

  let price = Math.round(sourcePriceEUR * margin + logisticsBuffer);
  const remainder = price % 10;
  if (remainder < 5) price = price - remainder - 1;
  else price = price + (9 - remainder);

  return price;
}

export function calculateMemberPrice(listingPrice: number) {
  return Math.round(listingPrice * 0.9);
}

export function calculateConfidence(item: ScrapedItem, description: string = "") {
  let score = 100;
  const priceEUR = convertToEUR(item.source_price, item.currency || item.locale || 'EUR');
  const desc = description.toLowerCase();
  const title = item.title.toLowerCase();

  if (NON_CLOTHING_KEYWORDS.some(k => title.includes(k) || desc.includes(k))) return 0;

  const priceFloors: Record<string, number> = {
    "Louis Vuitton": 150, "Hermès": 200, "Chanel": 200, "Chrome Hearts": 100,
    "Prada": 100, "Moncler": 80, "Canada Goose": 150, "Stone Island": 60,
    "Corteiz": 40, "Essentials": 30
  };

  const floor = priceFloors[item.brand];
  if (floor && priceEUR < floor) score -= 95;

  const hasProof = PROOF_KEYWORDS.some(k => desc.includes(k));
  if (hasProof) score += 10;

  if (desc.includes("replica") || desc.includes("fake") || desc.includes("ua") || desc.includes("copy") || desc.includes("kopi")) {
    score -= 100;
  }

  if (highRiskFakes.includes(item.brand) && !hasProof) {
    score -= 30;
  }

  return Math.min(100, Math.max(0, score));
}

export function detectSubCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('jacket') || t.includes('puffer') || t.includes('coat') || t.includes('vest') || t.includes('fleece') || t.includes('jakke') || t.includes('parka') || t.includes('bomber') || t.includes('windbreaker') || t.includes('kurtka')) return 'Jackets';
  if (t.includes('pant') || t.includes('jeans') || t.includes('cargo') || t.includes('shorts') || t.includes('bukser') || t.includes('sweatpants') || t.includes('trouser') || t.includes('spodnie')) return 'Pants';
  if (t.includes('sock') || t.includes('strømper') || t.includes('socks')) return 'Socks';
  if (t.includes('beanie') || t.includes('hat') || t.includes('cap') || t.includes('hue') || t.includes('bucket') || t.includes('headwear') || t.includes('czapka')) return 'Headwear';
  if (t.includes('hoodie') || t.includes('sweater') || t.includes('knit') || t.includes('sweatshirt') || t.includes('cardigan') || t.includes('pullover') || t.includes('bluza') || t.includes('trøje')) return 'Sweaters';
  if (t.includes('t-shirt') || t.includes('tee') || t.includes('top') || t.includes('shirt') || t.includes('polo') || t.includes('skjorte') || t.includes('koszula')) return 'Tops';
  if (t.includes('bag') || t.includes('backpack') || t.includes('wallet') || t.includes('belt') || t.includes('glasses') || t.includes('scarf') || t.includes('gloves') || t.includes('torebka')) return 'Accessories';
  return 'Archive';
}

export async function saveToSupabase(item: ScrapedItem) {
  const priceEUR = convertToEUR(item.source_price, item.currency || item.locale || 'EUR');
  const confidence = calculateConfidence(item);
  const listingPrice = calculateListingPrice(priceEUR, item.brand);
  const memberPrice = calculateMemberPrice(listingPrice);
  const profit = listingPrice - priceEUR - 20;
  
  let status = 'pending_review';
  const subCategory = detectSubCategory(item.title);

  if (confidence > 85 && profit > 25 && autoApproveBrands.includes(item.brand)) {
    status = 'available';
  }

  // Map to DB Schema
  // Note: we are using upsert with vinted_id as key. If source is not Vinted, we need to handle that.
  // The 'vinted_id' column in DB is a TEXT UNIQUE constraint. We can use it for 'source_id'.
  // However, we should probably rename it eventually or just treat it as 'external_id'.
  // For Grailed, we'll prefix with 'grailed_'.

  const { error } = await supabase.from('pulse_inventory').upsert({
    vinted_id: item.source_id,
    brand: item.brand,
    title: item.title,
    source_url: item.source_url,
    source_price: priceEUR,
    listing_price: listingPrice,
    member_price: memberPrice,
    potential_profit: profit,
    images: [item.image],
    category: subCategory,
    confidence_score: confidence,
    seller_rating: item.seller_rating || 5.0,
    seller_reviews_count: item.seller_reviews || 50,
    locale: item.locale || 'US', // Default for Grailed
    shipping_zone: item.platform === 'grailed' ? 'GLOBAL' : 'EU_ONLY',
    status: status,
    currency: 'EUR',
    is_auto_approved: status === 'available',
    last_pulse_check: new Date().toISOString()
  }, { onConflict: 'vinted_id' });

  if (error) {
    console.error(`❌ [Inventory] Error saving ${item.source_id}:`, error.message);
  } else {
    // console.log(`✅ [Inventory] Saved ${item.source_id}`);
  }
}


export async function checkVintedLive(url: string): Promise<boolean> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const isSold = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('sold') || text.includes('solgt') || text.includes('verkauft') || text.includes('sprzedane');
    });
    return !isSold;
  } catch (err) {
    return false;
  } finally {
    await browser.close();
  }
}

