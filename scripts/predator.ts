// Auvra Pulse: The Predator Algorithm
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

export interface VintedItem {
  vinted_id: string;
  title: string;
  source_url: string;
  source_price: number;
  image: string;
  brand: string;
  condition: string;
  seller_rating?: number;
  seller_reviews?: number;
  locale: string;
}

const luxuryBrands = ["Louis Vuitton", "Hermès", "Chanel", "Chrome Hearts", "Prada"];
const highRiskFakes = ["Essentials", "Corteiz", "Hellstar", "Sp5der", "Jordan", "Nike", "Yeezy"];
const autoApproveBrands = ["Ralph Lauren", "Carhartt", "ASICS", "Lacoste", "Supreme", "The North Face", "Arc'teryx"];

// Authenticity check keywords
const PROOF_KEYWORDS = ["receipt", "kvittering", "invoice", "faktura", "rechnung", "bought from", "købt i", "authenticity", "authentic", "ægte", "original"];

// Translation Mapping for common terms
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
};

function parseVintedPrice(priceText: string): number {
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

function translateTerm(text: string): string {
  if (!text) return text;
  const lower = text.toLowerCase().trim();
  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];
  const words = lower.split(' ');
  const translatedWords = words.map(w => TRANSLATIONS[w] || w);
  const fullTranslated = translatedWords.join(' ');
  return fullTranslated.charAt(0).toUpperCase() + fullTranslated.slice(1).toLowerCase();
}

function sanitizeTitle(rawTitle: string): string {
  let clean = rawTitle.split(',')[0].split(' – ')[0].split(' - ')[0].split(' | ')[0];
  clean = clean.replace(/vinted/gi, '').replace(/sold/gi, '').replace(/buying/gi, '').replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  return clean.split(' ').map(word => translateTerm(word)).join(' ');
}

function convertToEUR(price: number, locale: string): number {
  const rate = CONVERSION_RATES[locale] || 1;
  return price * rate;
}

export function calculateListingPrice(sourcePriceEUR: number) {
  let margin = 1.6;
  if (sourcePriceEUR > 50) margin = 1.5; 
  if (sourcePriceEUR > 200) margin = 1.4;
  if (sourcePriceEUR > 1000) margin = 1.3;
  return Math.round(sourcePriceEUR * margin + 20);
}

export function calculateConfidence(item: VintedItem, description: string = "") {
  let score = 100;
  const priceEUR = convertToEUR(item.source_price, item.locale);
  const desc = description.toLowerCase();

  // 1. Price Floor Check
  const priceFloors: Record<string, number> = {
    "Louis Vuitton": 150, "Hermès": 200, "Chanel": 200, "Chrome Hearts": 100,
    "Prada": 100, "Moncler": 80, "Canada Goose": 150, "Stone Island": 60,
    "Corteiz": 40, "Essentials": 30
  };

  const floor = priceFloors[item.brand];
  if (floor && priceEUR < floor) score -= 95;

  // 2. Keyword Check (Positive Signal)
  const hasProof = PROOF_KEYWORDS.some(k => desc.includes(k));
  if (hasProof) score += 10;

  // 3. Keyword Check (Negative Signal)
  if (desc.includes("replica") || desc.includes("fake") || desc.includes("ua") || desc.includes("copy") || desc.includes("kopi")) {
    score -= 100;
  }

  // 4. Force manual review for high-risk brands without proof
  if (highRiskFakes.includes(item.brand) && !hasProof) {
    score -= 30;
  }

  return Math.min(100, Math.max(0, score));
}

function detectSubCategory(title: string): string {
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

export async function scrapeBrand(brand: string, locale: string): Promise<VintedItem[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const searchUrl = `https://www.vinted.${locale}/vetements?search_text=${encodeURIComponent(brand)}&order=newest_first&new_with_tags=1`;
  
  console.log(`[Predator] Navigating to: ${searchUrl}`);
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    console.log(`[Predator] Page loaded: ${page.url()}`);
    const items = await page.evaluate((brandName) => {
      const cards = Array.from(document.querySelectorAll('.feed-grid__item'));
      console.log(`[Predator - Page Eval] Found ${cards.length} cards.`);
      return cards.map(card => {
        const linkEl = card.querySelector('a[href*="/items/"]');
        const priceEl = card.querySelector('h3, .web_ui__ItemBox__title, [data-testid$="price"]');
        const imgEl = card.querySelector('img');
        const subtitleEl = card.querySelector('.web_ui__ItemBox__subtitle');
        const href = linkEl?.getAttribute('href') || '';
        const vintedId = href.split('/')?.pop()?.split('-')?.[0] || '';
        const title = linkEl?.getAttribute('title') || imgEl?.getAttribute('alt') || '';
        const priceText = card.textContent?.match(/([0-9\s,.]+)\s?(?:kr|€|zł)/)?.[0] || '';
        return {
          vinted_id: vintedId,
          title: title,
          source_url: href ? (href.startsWith('http') ? href : `https://www.vinted.${document.location.hostname.split('.').pop() || 'dk'}${href}`) : '',
          source_price_raw: priceText,
          image: imgEl?.src || '',
          brand: brandName,
          condition: subtitleEl?.textContent?.trim() || 'Very Good'
        };
      });
    }, brand);
    
    console.log(`[Predator] Scraped ${items.length} raw items.`);
    if (items.length > 0) console.log(`[Predator] First raw item:`, items[0]);

    return items.filter(item => item.vinted_id).map(item => ({
      ...item,
      source_price: parseVintedPrice(item.source_price_raw),
      locale: locale,
      title: sanitizeTitle(item.title),
      condition: translateTerm(item.condition)
    })).filter(item => item.source_price > 0);
  } catch (err) {
    console.error(`[Predator] ScrapeBrand failed for ${brand} on .${locale}:`, err);
    return [];
  } finally {
    await browser.close();
  }
}

export async function saveToSupabase(items: VintedItem[]) {
  for (const item of items) {
    const priceEUR = convertToEUR(item.source_price, item.locale);
    const confidence = calculateConfidence(item);
    const listingPrice = calculateListingPrice(priceEUR);
    const profit = listingPrice - priceEUR - 20;
    
    let status = 'pending_review';
    let displayImage = item.image;
    const subCategory = detectSubCategory(item.title);

    // Auto-approve logic based on profit and confidence
    if (confidence > 95 && profit > 40 && autoApproveBrands.includes(item.brand)) {
      status = 'available';
    }

    // Uncomment for Cloudinary image processing in production
    // if (status === 'available') {
    //   const processed = await processImage(item.image);
    //   displayImage = processed.url;
    //   if (processed.hasFace) status = 'pending_review';
    // }

    const { error: upsertError } = await supabase.from('pulse_inventory').upsert({
      vinted_id: item.vinted_id,
      brand: item.brand,
      title: item.title,
      source_url: item.source_url,
      source_price: priceEUR,
      listing_price: listingPrice,
      potential_profit: profit,
      images: [displayImage],
      category: subCategory,
      confidence_score: confidence,
      seller_rating: 5.0,
      seller_reviews_count: 50,
      locale: item.locale,
      shipping_zone: 'EU_ONLY',
      status: status,
      currency: 'EUR',
      is_auto_approved: status === 'available',
      last_pulse_check: new Date().toISOString()
    }, { onConflict: 'vinted_id' });

    if (upsertError) {
      console.error(`❌ [Predator - Upsert Error] Failed to save ${item.vinted_id}:`, upsertError.message);
    } else {
      // console.log(`✅ Saved ${item.vinted_id}`);
    }
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
