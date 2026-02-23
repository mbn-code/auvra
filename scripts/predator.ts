// Auvra Pulse: Vinted Scraper
import { chromium } from 'playwright';
import { ScrapedItem, parseVintedPrice, sanitizeTitle, translateTerm } from './lib/inventory';

export async function scrapeVinted(brand: string, locale: string): Promise<ScrapedItem[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const searchUrl = `https://www.vinted.${locale}/vetements?search_text=${encodeURIComponent(brand)}&order=newest_first&new_with_tags=1`;
  
  console.log(`[Predator] Navigating to: ${searchUrl}`);
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    const items = await page.evaluate((brandName) => {
      const cards = Array.from(document.querySelectorAll('.feed-grid__item'));
      return cards.map(card => {
        const linkEl = card.querySelector('a[href*="/items/"]');
        const priceEl = card.querySelector('h3, .web_ui__ItemBox__title, [data-testid$="price"]');
        const imgEl = card.querySelector('img');
        
        const href = linkEl?.getAttribute('href') || '';
        const vintedId = href.split('/')?.pop()?.split('-')?.[0] || '';
        const title = linkEl?.getAttribute('title') || imgEl?.getAttribute('alt') || '';
        const priceText = card.textContent?.match(/([0-9\s,.]+)\s?(?:kr|€|zł)/)?.[0] || '';
        
        // Robust Size Extraction
        const fullText = card.textContent || '';
        let size = 'OS';
        
        // Vinted typical format: [Brand][Size] · [Condition]
        // The size is usually the text right before the '·'
        const parts = fullText.split('·');
        if (parts.length > 0) {
          const infoPart = parts[0].trim();
          // Extract the last word or alphanumeric sequence from infoPart
          // which is almost always the size
          const words = infoPart.split(/\s+/);
          const lastWord = words[words.length - 1];
          
          // Match standard size patterns at the end of the brand/info string
          // This matches "CorteizXL" or just "XL"
          const sizeMatch = lastWord.match(/(XXS|XS|S|M|L|XL|XXL|XXXL|[0-9]{2,3})$/i);
          if (sizeMatch) {
            size = sizeMatch[0];
          }
        }
        
        return {
          vinted_id: vintedId,
          title: title,
          source_url: href ? (href.startsWith('http') ? href : `https://www.vinted.de${href}`) : '',
          source_price_raw: priceText,
          image: imgEl?.src || '',
          brand: brandName,
          condition: 'Very Good', 
          size: size.toUpperCase()
        };
      });
    }, brand);

    
    return items.filter(item => item.vinted_id).map(item => ({
      source_id: item.vinted_id,
      title: sanitizeTitle(item.title),
      source_url: item.source_url,
      source_price: parseVintedPrice(item.source_price_raw),
      currency: locale === 'pl' ? 'PLN' : locale === 'dk' ? 'DKK' : locale === 'se' ? 'SEK' : 'EUR',
      image: item.image,
      brand: brand,
      condition: translateTerm(item.condition),
      size: item.size,
      seller_rating: 5.0,
      seller_reviews: 50,
      locale: locale,
      platform: 'vinted'
    })).filter(item => item.source_price > 0) as ScrapedItem[];
  } catch (err) {
    console.error(`[Predator] ScrapeVinted failed for ${brand} on .${locale}:`, err);
    return [];
  } finally {
    await browser.close();
  }
}

// CLI Execution
if (process.argv[2]) {
  const brand = process.argv[2];
  console.log(`🚀 Starting CLI hunt for: ${brand}`);
  scrapeVinted(brand, "de").then(items => {
    console.log(`✅ Found ${items.length} items.`);
    import('./lib/inventory').then(lib => {
      items.forEach(item => lib.saveToSupabase(item));
    });
  });
}
