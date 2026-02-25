import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

/**
 * AUVRA VIBE SEARCH API (Headless Pinterest Integration)
 */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || 'luxury archive fashion';
  
  let browser;
  try {
    console.log(`[VibeSearch] Launching Headless Hunt for: ${q}`);
    
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}&rs=typed`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for some images to load
    await page.waitForSelector('img', { timeout: 10000 });

    // Scroll a bit to trigger more loads
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1000));

    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .map(img => img.src)
        .filter(src => src.includes('pinimg.com'))
        .map(src => src.replace('236x', '736x').replace('474x', '736x')); // Upscale to high res
    });

    const uniqueImages = [...new Set(images)].slice(0, 12);

    if (uniqueImages.length === 0) {
      throw new Error("No images found on page");
    }

    return NextResponse.json(uniqueImages.map((url, i) => ({
      id: `pin-${i}-${Math.random().toString(36).substring(7)}`,
      url
    })));

  } catch (error) {
    console.error('[VibeSearch] Scraping Error:', error);
    // Silent Fallback to high-quality Unsplash seeds
    return NextResponse.json([
      { id: 'f1', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=500' },
      { id: 'f2', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=500' },
      { id: 'f3', url: 'https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&q=80&w=500' },
      { id: 'f4', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=500' }
    ]);
  } finally {
    if (browser) await browser.close();
  }
}
