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
    if (!response.ok) return null;
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

async function generateStaticPost(item: any, filename: string) {
  if (!item || !item.images || !item.images[0]) return;
  
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  const imageBuffer = await fetchAndConvertImage(item.images[0]);
  if (!imageBuffer) return;
  const img = await loadImage(imageBuffer);

  ctx.drawImage(img, -200, -200, 1480, 2320); 
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; 
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 100;
  ctx.shadowOffsetY = 50;
  roundRect(ctx, 80, 350, 920, 1150, 60);
  ctx.fill();
  ctx.shadowColor = "transparent";

  const scale = Math.max(920 / img.width, 920 / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.save();
  roundRect(ctx, 80, 350, 920, 920, 60);
  ctx.clip();
  ctx.drawImage(img, 80 - (w - 920)/2, 350, w, h);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#A1A1AA';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(item.brand.toUpperCase(), 140, 1330);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 52px sans-serif';
  const cleanTitle = item.title.length > 20 ? item.title.substring(0, 20) + "..." : item.title;
  ctx.fillText(cleanTitle, 140, 1400);

  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(`€${Math.round(item.listing_price)}`, 740, 1400);

  const discounts = ["-30%", "-50%", "-70%"];
  const discount = discounts[Math.floor(Math.random() * discounts.length)];
  ctx.fillStyle = '#EF4444'; 
  roundRect(ctx, 780, 430, 180, 90, 25); 
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(discount, 870, 490);

  const msgY = 180 + Math.random() * 80;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 40;
  roundRect(ctx, 60, msgY, 750, 150, 45);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(135, msgY + 75, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(NAMES[Math.floor(Math.random() * NAMES.length)], 135, msgY + 85);

  const caption = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = '38px sans-serif';
  ctx.fillText(caption.replace('€', `€${Math.round(item.listing_price)}`), 210, msgY + 88);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
}

async function generateScrollVideo(items: any[], filename: string, duration: number = 10) {
  console.log(`🎥 Generating Scroll Video: ${filename}...`);
  const cardHeight = 550;
  const gap = 50;
  const totalHeight = items.length * (cardHeight + gap) + 500;
  const canvas = createCanvas(1080, totalHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F4F4F5';
  ctx.fillRect(0, 0, 1080, totalHeight);

  // Header
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1080, 300);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 70px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("AUVRA ARCHIVE", 540, 160);
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#10B981';
  ctx.fillText("● GLOBAL PULSE ACTIVE", 540, 220);

  let currentY = 350;
  for (const item of items) {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 30;
    roundRect(ctx, 50, currentY, 980, cardHeight, 50);
    ctx.fill();
    ctx.shadowColor = "transparent";

    try {
      const imgBuffer = await fetchAndConvertImage(item.images[0]);
      if (imgBuffer) {
        const img = await loadImage(imgBuffer);
        const size = 450;
        ctx.save();
        roundRect(ctx, 100, currentY + 50, size, size, 40);
        ctx.clip();
        ctx.drawImage(img, 100, currentY + 50, size, size);
        ctx.restore();
      }
    } catch(e) {}

    ctx.textAlign = 'left';
    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(item.brand.toUpperCase(), 580, currentY + 160);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 44px sans-serif';
    let title = item.title.substring(0, 18) + (item.title.length > 18 ? "..." : "");
    ctx.fillText(title, 580, currentY + 230);

    ctx.fillStyle = '#000000';
    roundRect(ctx, 580, currentY + 320, 260, 90, 45);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`€${Math.round(item.listing_price)}`, 620, currentY + 382);

    const discount = ["-30%", "-50%", "-70%"][Math.floor(Math.random() * 3)];
    ctx.fillStyle = '#EF4444';
    roundRect(ctx, 860, currentY + 320, 140, 90, 25);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(discount, 930, 378 + currentY);

    currentY += cardHeight + gap;
  }

  const longImagePath = path.join(OUTPUT_DIR, `temp_${filename}.png`);
  fs.writeFileSync(longImagePath, canvas.toBuffer('image/png'));

  const videoPath = path.join(OUTPUT_DIR, filename);
  const scrollDistance = totalHeight - 1920;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(longImagePath)
      .loop(duration)
      .fps(30)
      .videoFilters([
        `crop=1080:1920:0:t/${duration}*${scrollDistance}`
      ])
      .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-preset ultrafast', '-t', duration.toString()])
      .save(videoPath)
      .on('end', () => {
        if (fs.existsSync(longImagePath)) fs.unlinkSync(longImagePath);
        resolve(true);
      })
      .on('error', (err) => {
        console.error(`Video Gen Failed: ${filename}`, err.message);
        resolve(false); 
      });
  });
}

async function runDailyFactory() {
  console.log("🏭 Auvra Multi-Batch Factory Initializing...");

  const oldFiles = fs.readdirSync(OUTPUT_DIR);
  oldFiles.forEach(f => { if(f !== '.gitkeep') {
    try { fs.unlinkSync(path.join(OUTPUT_DIR, f)); } catch(e) {}
  }});

  const { data: allAvailable } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .order('listing_price', { ascending: false });

  if (!allAvailable || allAvailable.length < 30) {
    console.log("❌ Not enough inventory for 30 images.");
    return;
  }

  // 1. Batch High (Top 10)
  console.log("💎 Generating High-Tier Batch...");
  const highItems = allAvailable.slice(0, 10);
  for (let i = 0; i < 10; i++) {
    await generateStaticPost(highItems[i], `high_post_${i}.png`);
  }

  // 2. Batch Mid (10 Items around €100-300)
  console.log("🔥 Generating Mid-Tier Batch...");
  const midItems = allAvailable.filter(i => i.listing_price < 400 && i.listing_price > 80).slice(0, 10);
  for (let i = 0; i < 10; i++) {
    await generateStaticPost(midItems[i], `mid_post_${i}.png`);
  }

  // 3. Batch Mix (10 Random from remaining)
  console.log("🌪️ Generating Mix Batch...");
  const mixItems = allAvailable.sort(() => 0.5 - Math.random()).slice(0, 10);
  for (let i = 0; i < 10; i++) {
    await generateStaticPost(mixItems[i], `mix_post_${i}.png`);
  }

  // 4. Videos
  console.log("🎬 Generating Videos...");
  await generateScrollVideo(highItems, "video_luxury_scroll.mp4", 12);
  await generateScrollVideo(midItems, "video_steals_scroll.mp4", 10);

  // Send to Telegram
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.mp4'))
    .map(f => path.join(OUTPUT_DIR, f));
  
  if (files.length > 0) {
    await sendTelegramMedia(files, `📦 AUVRA DAILY BUNDLE\n30 Static Posts\n2 Motion Videos\n\nTotal: ${files.length} Assets`);
  }

  console.log("✅ All Assets Processed.");
}

runDailyFactory();
