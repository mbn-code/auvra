import sys
import json
import asyncio
from playwright.async_api import async_playwright

async def run(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            
            # Simple heuristic: try to grab main image and title
            title = await page.title()
            
            # Vinted images usually have meta property="og:image"
            og_image = await page.evaluate("() => document.querySelector('meta[property=\"og:image\"]')?.content")
            
            # Or get the first big image
            if not og_image:
                og_image = await page.evaluate("() => document.querySelector('img.item-photo--1, img[alt*=\"photo\"]')?.src")
                
            brand = await page.evaluate("() => document.querySelector('a[href*=\"/brand/\"]')?.innerText || 'Unknown'")
            
            print(json.dumps({
                "url": url,
                "title": title,
                "image_url": og_image,
                "brand": brand.strip() if brand else None
            }))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
        finally:
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
    asyncio.run(run(sys.argv[1]))
