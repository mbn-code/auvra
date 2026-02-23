// Auvra Pulse: Grailed Scraper
import { chromium } from 'playwright';
import { ScrapedItem, parseVintedPrice, sanitizeTitle, translateTerm } from './lib/inventory';

export async function scrapeGrailed(brand: string): Promise<ScrapedItem[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  // Convert brand to slug (e.g. "Louis Vuitton" -> "louis-vuitton")
  const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
  const searchUrl = `https://www.grailed.com/designers/${brandSlug}`;
  
  console.log(`[Predator-G] Navigating to: ${searchUrl}`);
  
  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Grailed often has a "feed" div
    // We need to wait for items to load.
    // Selectors might change, so we'll try to be generic.
    try {
      await page.waitForSelector('div[class*="Feed_feedItem"]', { timeout: 10000 });
    } catch (e) {
      console.log(`[Predator-G] Feed selector timeout, checking alternative...`);
    }

    const items = await page.evaluate((brandName) => {
      // Grailed uses complex class names, but often has specific data attributes or structures
      // Look for grid items
      const cards = Array.from(document.querySelectorAll('div[class*="Feed_feedItem"], div[class*="feed-item"]'));
      
      return cards.map(card => {
        const linkEl = card.querySelector('a');
        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('p[class*="ListingMetadata_title"]');
        const priceEl = card.querySelector('span[class*="ListingPrice_price"]');
        const sizeEl = card.querySelector('p[class*="ListingMetadata_size"]');

        const href = linkEl?.getAttribute('href') || '';
        // Grailed ID is usually in the URL: /listings/123456-title
        const sourceId = href.match(/\/listings\/(\d+)/)?.[1] || '';
        
        const title = titleEl?.textContent || imgEl?.getAttribute('alt') || '';
        const priceText = priceEl?.textContent || '';
        let size = sizeEl?.textContent || '';

        if (!size) {
          const sizeMatch = title.match(/(XXS|XS|S|M|L|XL|XXL|XXXL|OS)/i);
          if (sizeMatch) size = sizeMatch[1];
        }

        // Only "New" or "Gently Used" from Grailed usually. 
        // We can't easily see condition on grid always, assume 'Very Good' if not specified.
        
        return {
          source_id: `grailed_${sourceId}`,
          title: title,
          source_url: href ? (href.startsWith('http') ? href : `https://www.grailed.com${href}`) : '',
          source_price_raw: priceText,
          image: imgEl?.src || '',
          brand: brandName,
          condition: 'Very Good', // Default for Grailed (usually high quality)
          size: size
        };
      });
    }, brand);
    
    console.log(`[Predator-G] Scraped ${items.length} raw items.`);

    return items.filter(item => item.source_id && item.source_id !== 'grailed_').map(item => {
      // Parse price "$120"
      const priceVal = parseFloat(item.source_price_raw.replace(/[^0-9.]/g, ''));
      
      return {
        source_id: item.source_id,
        title: sanitizeTitle(item.title),
        source_url: item.source_url,
        source_price: priceVal,
        currency: 'USD', // Grailed is USD
        image: item.image,
        brand: brand,
        condition: 'Very Good',
        size: item.size,
        seller_rating: 5.0, // Assumption for now
        seller_reviews: 10,
        locale: 'US', // Grailed is mostly US/Global
        platform: 'grailed'
      };
    }).filter(item => item.source_price > 0) as ScrapedItem[];

  } catch (err) {
    console.error(`[Predator-G] Scrape failed for ${brand}:`, err);
    return [];
  } finally {
    await browser.close();
  }
}
