// Auvra TikTok Hunter: Automated Curation Tool
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';
import { sendTelegramMedia } from './distribute-content';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const OUTPUT_DIR = path.join(process.cwd(), 'social-assets', 'tiktok-curation');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function downloadVideo(vidUrl: string, brand: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`📥 Attempting SnapTik download for: ${vidUrl}`);
    await page.goto('https://snaptik.app/', { waitUntil: 'networkidle' });
    await page.fill('#url', vidUrl);
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('.download-block', { timeout: 20000 });
    
    const downloadUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.download-block a')) as HTMLAnchorElement[];
      return links.find(a => a.href.includes('token'))?.href || links[0].href;
    });

    if (downloadUrl) {
      const response = await fetch(downloadUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `tiktok_${brand.replace(/\s+/g, '_')}_${Date.now()}.mp4`;
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`📦 Secured: ${filename}`);
      
      await sendTelegramMedia([filePath], `📽️ AUVRA HUNTER: ${brand} Showcase\nSource: ${vidUrl}`, false);
    }
  } catch (e) {
    console.error(`❌ Download failed for ${vidUrl}`);
  } finally {
    await browser.close();
  }
}

// Main Tool: Accepts URL or Brand
const input = process.argv[2] || "Arc'teryx";

if (input.startsWith('http')) {
  downloadVideo(input, "Imported");
} else {
  // If it's a brand, we'll give instructions for now as TikTok is blocking headless search
  console.log(`🕵️ TikTok Hunter: Auto-search for "${input}" is currently being limited by TikTok's bot defense.`);
  console.log(`💡 Tip: Paste a direct TikTok URL to download it without a watermark and send to Telegram.`);
}
