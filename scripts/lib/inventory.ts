import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ScrapedItem {
  source_id: string;
  title: string;
  source_url: string;
  source_price: number;
  currency: string;
  image: string;
  brand: string;
  condition: string;
  size?: string;
  seller_rating?: number;
  seller_reviews?: number;
  locale?: string;
  platform: 'vinted' | 'grailed' | 'aliexpress';
}

const luxuryBrands = ["Louis Vuitton", "Hermès", "Chanel", "Chrome Hearts", "Prada", "Burberry", "Gucci", "Bottega Veneta", "Amiri"];
const gorpcoreBrands = ["Arc'teryx", "The North Face", "Patagonia", "Salomon", "Oakley"];
const streetwearBrands = ["Corteiz", "Stüssy", "Essentials", "Hellstar", "Sp5der", "Supreme", "A Bathing Ape", "Broken Planet", "Denim Tears", "Gallery Dept"];

const highRiskFakes = ["Essentials", "Corteiz", "Hellstar", "Sp5der", "Broken Planet"];
const autoApproveBrands = [
  "Ralph Lauren", "Carhartt", "ASICS", "Lacoste", "Supreme", "The North Face", 
  "Arc'teryx", "Patagonia", "New Balance", "Salomon", "Oakley", "Dickies", 
  "Diesel", "Levis", "Adidas", "Nike", "Louis Vuitton", "Prada", "Burberry", 
  "Moncler", "Chrome Hearts", "Chanel", "Hermès", "Gucci", "Bottega Veneta", "Amiri"
];

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
  "DKK": 0.13, "PLN": 0.23, "SEK": 0.088,
  "USD": 0.92, "GBP": 1.17 
};

async function processImage(imageUrl: string, brand: string): Promise<{ url: string, hasFace: boolean }> {
  try {
    let uploadOptions: any = {
      folder: "auvra/archive",
    };
    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
    const transformedUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 1000, height: 1250, crop: "fill", gravity: "center" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    return { url: transformedUrl, hasFace: false };
  } catch (err) {
    return { url: imageUrl, hasFace: false };
  }
}

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

export function getBrandTier(brand: string): number {
  const b = brand || "";
  if (["Louis Vuitton", "Hermès", "Chanel", "Prada", "Chrome Hearts", "Moncler"].includes(b)) return 1;
  if (["Stone Island", "Burberry", "CP Company", "Ralph Lauren", "Bottega Veneta"].includes(b)) return 2;
  if (["Arc'teryx", "Salomon", "Patagonia", "The North Face", "Oakley"].includes(b)) return 3;
  if (["Supreme", "A Bathing Ape", "Corteiz", "Stüssy", "Hellstar", "Sp5der", "Denim Tears", "Gallery Dept", "Broken Planet"].includes(b)) return 4;
  return 5;
}

export function calculateListingPrice(sourcePriceEUR: number, brand: string, condition: string = "", title: string = "") {
  const { calculateListingPriceEngine } = require('../../src/lib/pricing');
  return calculateListingPriceEngine(sourcePriceEUR, brand, condition, title);
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
  const listingPrice = calculateListingPrice(priceEUR, item.brand, item.condition, item.title);
  const subCategory = detectSubCategory(item.title);

  // Push directly to unverified_assets staging table for aesthetic filtering
  const { error } = await supabase.from('unverified_assets').upsert({
    vinted_id: item.source_id,
    brand: item.brand,
    title: item.title,
    condition: item.condition,
    source_url: item.source_url,
    source_price: priceEUR,
    listing_price: listingPrice,
    images: [item.image],
    category: subCategory,
    locale: item.locale || 'US',
    shipping_zone: item.platform === 'grailed' ? 'GLOBAL' : 'EU_ONLY',
    status: 'pending'
  }, { onConflict: 'vinted_id' });

  if (error) {
    console.error(`❌ [Inventory] Error saving to staging ${item.source_id}:`, error.message);
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
