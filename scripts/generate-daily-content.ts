import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { sendTelegramMedia } from './distribute-content';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OUTPUT_DIR = path.join(process.cwd(), 'social-assets');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const NAMES = ["J", "M", "S", "A", "K", "D", "T", "L"];
const CAPTIONS = [
  "Wait is this real?? 💀", "No way this is €", "Link?? Need this rn",
  "How is this still sitting...", "Archive pulse going crazy", "Cop or drop? 🤔",
  "This price is illegal", "Need for the rotation", "Valid find?", "Sending this to the gc"
];

async function fetchAndConvertImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await sharp(Buffer.from(arrayBuffer)).png().toBuffer();
  } catch (e) { return null; }
}

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

async function generateBatch(items: any[], type: 'high' | 'mid') {
  console.log(`📸 Generating 10 ${type}-tier Static Posts...`);
  for (const [index, item] of items.entries()) {
    await generateStaticPost(item, index, type);
  }
}

async function generateStaticPost(item: any, index: number, type: 'high' | 'mid') {
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  // Background (Dimmed Product)
  const imageBuffer = await fetchAndConvertImage(item.images[0]);
  if (!imageBuffer) return;
  const img = await loadImage(imageBuffer);

  ctx.drawImage(img, -200, -200, 1480, 2320); 
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
  ctx.fillRect(0, 0, 1080, 1920);

  // Card UI
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 80;
  ctx.shadowOffsetY = 40;
  roundRect(ctx, 100, 350, 880, 1100, 50);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Product inside card
  const scale = Math.max(880 / img.width, 880 / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.save();
  roundRect(ctx, 100, 350, 880, 880, 50);
  ctx.clip();
  ctx.drawImage(img, 100 - (w - 880)/2, 350, w, h);
  ctx.restore();

  // Info
  ctx.textAlign = 'left';
  ctx.fillStyle = '#888';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(item.brand.toUpperCase(), 160, 1300);

  ctx.fillStyle = '#000';
  ctx.font = 'bold 48px sans-serif';
  const cleanTitle = item.title.length > 22 ? item.title.substring(0, 22) + "..." : item.title;
  ctx.fillText(cleanTitle, 160, 1360);

  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(`€${Math.round(item.listing_price)}`, 780, 1360);

  // Discount Badge (NEW - High Impact)
  const discounts = ["-30%", "-50%", "-70%"];
  const discount = discounts[index % 3];
  
  ctx.fillStyle = '#FF3B30'; // Urgent Red
  roundRect(ctx, 750, 450, 200, 80, 20); // Top right of card
  ctx.fill();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(discount, 850, 505);

  // Message Overlay
  const msgY = 200 + Math.random() * 100;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 30;
  roundRect(ctx, 60, msgY, 700, 140, 40);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Avatar
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(130, msgY + 70, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(NAMES[Math.floor(Math.random() * NAMES.length)], 130, msgY + 80);

  // Caption
  const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';
  ctx.font = '36px sans-serif';
  ctx.fillText(caption.replace('€', `€${Math.round(item.listing_price)}`), 200, msgY + 82);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, `${type}_post_${index}.png`), buffer);
  console.log(`📸 Generated ${type} Post: ${item.brand}`);
}

async function generateScrollVideo(items: any[]) {
  console.log("🎥 Generating Scroll Video (this takes a moment)...");
  
  // 1. Create the Long Screenshot Canvas
  const cardHeight = 500;
  const gap = 40;
  const totalHeight = items.length * (cardHeight + gap) + 400; // Extra padding
  const canvas = createCanvas(1080, totalHeight);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FBFBFD'; // Apple-like grey
  ctx.fillRect(0, 0, 1080, totalHeight);

  // Header
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, 1080, 250);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("ARCHIVE PULSE", 540, 150);
  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#34C759';
  ctx.fillText("● Live Sync Active", 540, 200);

  // Draw Items
  let currentY = 290;
  for (const item of items) {
    // Card BG
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = "rgba(0,0,0,0.05)";
    ctx.shadowBlur = 20;
    roundRect(ctx, 40, currentY, 1000, cardHeight, 40);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Image
    try {
      const imgBuffer = await fetchAndConvertImage(item.images[0]);
      if (imgBuffer) {
        const img = await loadImage(imgBuffer);
        // Square crop on left
        const size = 420;
        ctx.save();
        roundRect(ctx, 80, currentY + 40, size, size, 30);
        ctx.clip();
        ctx.drawImage(img, 80, currentY + 40, size, size);
        ctx.restore();
      }
    } catch(e) {}

    // Text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(item.brand.toUpperCase(), 540, currentY + 140);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 40px sans-serif';
    let title = item.title.substring(0, 20) + (item.title.length>20 ? "..." : "");
    ctx.fillText(title, 540, currentY + 200);

    // Price Pill
    ctx.fillStyle = '#000';
    roundRect(ctx, 540, currentY + 280, 240, 80, 40);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`€${Math.round(item.listing_price)}`, 580, currentY + 335);

    // Discount Tag
    const discounts = ["-30%", "-50%", "-70%"];
    const discount = discounts[Math.floor(Math.random() * discounts.length)];
    ctx.fillStyle = '#FF3B30';
    roundRect(ctx, 800, currentY + 280, 140, 80, 20);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(discount, 830, currentY + 332);

    currentY += cardHeight + gap;
  }

  // Save the long image temp
  const longImagePath = path.join(OUTPUT_DIR, 'temp_long_scroll.png');
  fs.writeFileSync(longImagePath, canvas.toBuffer('image/png'));

  // 2. Animate with FFmpeg (Pan Down)
  const videoPath = path.join(OUTPUT_DIR, `post_video_scroll.mp4`);
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(longImagePath)
      .loop(8)
      .videoFilters([
        `crop=1080:1920:0:'min(t*${(totalHeight-1920)/8}, ${totalHeight-1920})'`
      ])
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-r 30'
      ])
      .save(videoPath)
      .on('end', () => {
        console.log("🎥 Scroll Video Generated!");
        fs.unlinkSync(longImagePath);
        resolve(true);
      })
      .on('error', (err) => {
        console.error("FFmpeg Error:", err);
        resolve(false);
      });
  });
}

async function runDailyFactory() {
  console.log("🏭 Auvra Content Factory Initializing...");

  const { data: highItems } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .order('listing_price', { ascending: false })
    .limit(10);

  if (highItems && highItems.length > 0) {
    await generateBatch(highItems, 'high');
  }

  const { data: midItems } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .lt('listing_price', 300)
    .gt('listing_price', 50)
    .limit(10);

  if (midItems && midItems.length > 0) {
    await generateBatch(midItems, 'mid');
  }

  const mixItems = [...(highItems || []).slice(0, 5), ...(midItems || []).slice(0, 5)];
  if (mixItems.length > 0) {
    await generateScrollVideo(mixItems);
  }

  // Send to Telegram
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('high_') || f.startsWith('mid_') || f.startsWith('post_video'))
    .map(f => path.join(OUTPUT_DIR, f));
  
  if (files.length > 0) {
    await sendTelegramMedia(files, "🔥 Auvra Content Drop: " + new Date().toLocaleDateString());
  }

  console.log("✅ Daily Content Batch Complete & Sent.");
}

runDailyFactory();
