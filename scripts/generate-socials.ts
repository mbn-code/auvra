import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OUTPUT_DIR = path.join(process.cwd(), 'social-assets');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function fetchAndConvertImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert WebP/AVIF to PNG for Canvas compatibility
    return await sharp(buffer).png().toBuffer();
  } catch (e) {
    console.error(`Failed to download/convert image: ${url}`);
    return null;
  }
}

async function generateSocials() {
  console.log("🎨 Starting Social Asset Factory...");

  // Fetch best inventory
  const { data: items } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .order('potential_profit', { ascending: false })
    .limit(10);

  if (!items) return;

  for (const [index, item] of items.entries()) {
    const canvas = createCanvas(1080, 1920); // TikTok Vertical Ratio
    const ctx = canvas.getContext('2d');

    // 1. Background: Blurred "Glass" Effect
    try {
      const imageBuffer = await fetchAndConvertImage(item.images[0]);
      if (!imageBuffer) continue;
      const img = await loadImage(imageBuffer);

      // Draw background (Zoomed in version of product)
      // ctx.filter = 'blur(40px) brightness(0.7)'; // Not supported in node-canvas TS types easily
      ctx.drawImage(img, -200, -200, 1480, 2320); // Oversize to fill
      
      // Dimming overlay instead of filter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. The "Card" (Floating UI)
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 20;
      roundRect(ctx, 140, 400, 800, 1000, 40); // Main card
      ctx.fill();
      ctx.shadowColor = "transparent";

      // 3. Product Image (Raw & Real)
      // Crop to square-ish to look like a gallery view
      const scale = Math.max(800 / img.width, 800 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      
      ctx.save();
      roundRect(ctx, 140, 400, 800, 800, 40); // Clip to top of card
      ctx.clip();
      ctx.drawImage(img, 140 - (w - 800)/2, 400, w, h);
      ctx.restore();

      // 4. "Native" Text (Not branded)
      ctx.textAlign = 'left';
      
      // Brand (Small, grey)
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText(item.brand.toUpperCase(), 190, 1260);

      // Title (Big, Black, Truncated)
      ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#000000';
      const cleanTitle = item.title.length > 25 ? item.title.substring(0, 25) + "..." : item.title;
      ctx.fillText(cleanTitle, 190, 1310);

      // Price (The Shock Factor)
      ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(`€${Math.round(item.listing_price)}`, 750, 1310);

      // 5. The "Message" Overlay (Social Proof)
      // Randomize position slightly to feel organic
      const msgY = 200 + Math.random() * 100;
      
      // Message Bubble
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 20;
      roundRect(ctx, 80, msgY, 600, 120, 30);
      ctx.fill();
      ctx.shadowColor = "transparent";

      // User Avatar (Circle)
      ctx.fillStyle = '#E5E5E5';
      ctx.beginPath();
      ctx.arc(140, msgY + 60, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(NAMES[Math.floor(Math.random() * NAMES.length)], 140, msgY + 68);

      // Message Text
      const captions = [
        "Wait is this real?? 💀",
        "No way this is €" + Math.round(item.listing_price),
        "Link?? Need this rn",
        "How is this still sitting...",
        "Archive pulse going crazy today",
        "Cop or drop? 🤔"
      ];
      const caption = captions[Math.floor(Math.random() * captions.length)];
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      ctx.fillText(caption, 200, msgY + 70);

    } catch (e) {
      console.error(`Failed to render image for ${item.title}`);
      continue;
    }

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, `native_story_${index}.png`), buffer);
    console.log(`✅ Generated: native_story_${index}.png`);
  }
}

// Utility for rounded rects
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const NAMES = ["J", "M", "S", "A", "K", "D"];

generateSocials();
