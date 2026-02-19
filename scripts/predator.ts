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
const highRiskFakes = ["Essentials", "Corteiz", "Hellstar", "Sp5der"];
const autoApproveBrands = ["Corteiz", "Stüssy", "Essentials", "Ralph Lauren", "Carhartt"];

const CONVERSION_RATES: Record<string, number> = {
  "dk": 0.14, "pl": 0.25, "de": 1.08, "fi": 1.08, "se": 0.095, "fr": 1.08,
};

function sanitizeTitle(rawTitle: string): string {
  // Take the first part of the title before common separators
  let clean = rawTitle.split(',')[0].split(' – ')[0].split(' - ')[0].split(' | ')[0];
  
  return clean
    .replace(/vinted/gi, '')
    .replace(/sold/gi, '')
    .replace(/buying/gi, '')
    .replace(/\[.*?\]/g, '') // Remove [brackets]
    .replace(/\(.*?\)/g, '') // Remove (parentheses)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function convertToUSD(price: number, locale: string): number {
  const rate = CONVERSION_RATES[locale] || 1;
  return price * rate;
}

export function calculateListingPrice(sourcePriceUSD: number) {
  // Adjusted pricing logic for better competitiveness
  let margin = 1.45; // 45% for low end
  if (sourcePriceUSD > 30) margin = 1.35; // 35% 
  if (sourcePriceUSD > 100) margin = 1.25; // 25%
  if (sourcePriceUSD > 500) margin = 1.15; // 15%
  
  return Math.round(sourcePriceUSD * margin + 12); // Reduced shipping buffer to $12
}

export function calculateConfidence(item: VintedItem) {
  let score = 100;
  const priceUSD = convertToUSD(item.source_price, item.locale);

  if (luxuryBrands.includes(item.brand)) {
    if (priceUSD < 150) score -= 80;
    if (priceUSD < 80) score -= 100;
  }
  
  if (highRiskFakes.includes(item.brand)) {
    if (priceUSD < 40) score -= 50;
  }
  return score;
}

async function processImage(imageUrl: string): Promise<{ url: string, hasFace: boolean }> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      // background_removal: "cloudinary_ai", // Optional: Requires activation
      detection: "adv_face",
    });

    const hasFace = (result.info?.detection?.adv_face?.data?.length || 0) > 0;
    return { url: result.secure_url, hasFace };
  } catch (err) {
    console.error(`[Pulse] Image processing failed:`, err);
    return { url: imageUrl, hasFace: false };
  }
}

export async function scrapeBrand(brand: string, locale: string): Promise<VintedItem[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const searchUrl = `https://www.vinted.${locale}/vetements?search_text=${encodeURIComponent(brand)}&order=newest_first&new_with_tags=1`;
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    const items = await page.evaluate((brandName) => {
      const cards = Array.from(document.querySelectorAll('[data-testid^="grid-item"], .feed-grid__item'));
      return cards.map(card => {
        const titleLink = card.querySelector('a[href*="/items/"], a[data-testid="item-link"]');
        const priceElement = card.querySelector('[data-testid$="price"], .feed-grid__item-price');
        const img = card.querySelector('img');
        const conditionElement = card.querySelector('.web_ui__ItemBox__subtitle');
        const titleElement = card.querySelector('.web_ui__ItemBox__title');

        const href = titleLink?.getAttribute('href');
        const vintedId = href?.split('/')?.pop()?.split('-')?.[0];
        
        // Prioritize inner text for cleaner titles
        const displayTitle = titleElement?.textContent || titleLink?.getAttribute('title') || '';
        
        let priceText = priceElement?.textContent || '';
        
        if (!priceText && displayTitle.includes(',')) {
           const match = displayTitle.match(/([0-9]+\s?[0-9]*[,.][0-9]+)/);
           if (match) priceText = match[1];
        }
        if (!priceText) {
           const match = displayTitle.match(/([0-9]+\.[0-9]+)/);
           if (match) priceText = match[1];
        }

        return {
          vinted_id: vintedId || '',
          title: displayTitle.trim(),
          source_url: href ? (href.startsWith('http') ? href : `https://www.vinted.${document.location.hostname.split('.').pop()}${href}`) : '',
          source_price: parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.') || '0'),
          image: img?.src || '',
          brand: brandName,
          condition: conditionElement?.textContent?.trim() || 'Very Good'
        };
      });
    }, brand);
    
    return items.filter(item => item.vinted_id && item.source_price > 0).map(item => ({
      ...item,
      locale: locale,
      title: sanitizeTitle(item.title)
    }));
  } catch (err) {
    return [];
  } finally {
    await browser.close();
  }
}

export async function saveToSupabase(items: VintedItem[]) {
  for (const item of items) {
    const priceUSD = convertToUSD(item.source_price, item.locale);
    const confidence = calculateConfidence(item);
    const listingPrice = calculateListingPrice(priceUSD);
    const profit = listingPrice - priceUSD - 12; // Adjusted buffer
    
    let status = 'pending_review';
    let displayImage = item.image;

    // Check for auto-approval
    if (confidence > 95 && profit > 35 && autoApproveBrands.includes(item.brand)) {
      const processed = await processImage(item.image);
      displayImage = processed.url;
      
      if (!processed.hasFace) {
        status = 'available';
      }
    }

    const { error } = await supabase
      .from('pulse_inventory')
      .upsert({
        vinted_id: item.vinted_id,
        brand: item.brand,
        title: item.title,
        source_url: item.source_url,
        source_price: priceUSD,
        listing_price: listingPrice,
        potential_profit: profit,
        images: [displayImage],
        category: 'Clothing',
        confidence_score: confidence,
        seller_rating: 5.0,
        seller_reviews_count: 50,
        locale: item.locale,
        status: status,
        is_auto_approved: status === 'available'
      }, { onConflict: 'vinted_id' });

    if (error) console.error(`[Pulse] Error saving ${item.vinted_id}:`, error.message);
  }
}

const brandToScrape = process.argv[2];
if (brandToScrape) {
  scrapeBrand(brandToScrape, "dk").then(saveToSupabase);
}
