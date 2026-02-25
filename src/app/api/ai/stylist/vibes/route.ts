import { NextRequest, NextResponse } from 'next/server';

/**
 * AUVRA VIBE SEARCH API (Real Pinterest Integration)
 */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || 'luxury archive fashion';
  
  try {
    console.log(`[VibeSearch] Querying Pinterest for: ${q}`);
    
    // Pinterest search URL
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}&rs=typed`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = await response.text();
    
    // Extract image URLs using regex
    // Pinterest pins usually have images in 236x, 474x or 736x formats
    // We look for the 736x (high res) versions
    const imageRegex = /https:\/\/i\.pinimg\.com\/736x\/[a-z0-9\/]+\.jpg/g;
    const matches = html.match(imageRegex) || [];
    
    // Deduplicate and limit to 12 results
    const uniqueImages = [...new Set(matches)].slice(0, 12);

    if (uniqueImages.length === 0) {
      console.warn("[VibeSearch] No images found via regex, falling back to static seeds.");
      // Fallback if scraping fails
      return NextResponse.json([
        { id: 'f1', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=500' },
        { id: 'f2', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=500' },
        { id: 'f3', url: 'https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&q=80&w=500' }
      ]);
    }

    return NextResponse.json(uniqueImages.map((url, i) => ({
      id: `pin-${i}-${Math.random().toString(36).substring(7)}`,
      url
    })));

  } catch (error) {
    console.error('[VibeSearch] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch vibes' }, { status: 500 });
  }
}
