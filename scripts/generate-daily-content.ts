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

async function fetchAndConvertImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return await sharp(Buffer.from(arrayBuffer)).png().toBuffer();
  } catch (e) { return null; }
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawIPhoneUI(ctx: any) {
  ctx.fillStyle = '#000';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("12:00", 60, 80);
  ctx.textAlign = 'right';
  ctx.fillText("📶 🔋", 1020, 80);
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.2;
  roundRect(ctx, 390, 1890, 300, 10, 5);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

async function generateRealisticScreenshot(item: any, filename: string, options: { showPopup?: boolean } = {}) {
  if (!item || !item.images || !item.images[0]) return;
  console.log(`📸 Capturing: ${filename} (${item.brand})`);

  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1080, 1920);

  // Header
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.font = '900 48px sans-serif';
  ctx.fillText("A  U  V  R  A", 540, 180);
  ctx.textAlign = 'right';
  ctx.font = '32px sans-serif';
  ctx.fillText("🛍️", 1020, 180);

  // Product Image
  const imageBuffer = await fetchAndConvertImage(item.images[0]);
  if (imageBuffer) {
    const img = await loadImage(imageBuffer);
    ctx.save();
    roundRect(ctx, 80, 280, 920, 1000, 60);
    ctx.clip();
    ctx.drawImage(img, 80, 280, 920, 1000);
    ctx.restore();
    ctx.strokeStyle = '#F4F4F5';
    ctx.lineWidth = 2;
    roundRect(ctx, 80, 280, 920, 1000, 60);
    ctx.stroke();
  }

  // Info
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000';
  ctx.font = '900 64px sans-serif';
  const title = item.title.toUpperCase();
  ctx.fillText(title.length > 25 ? title.substring(0, 25) + "..." : title, 80, 1380);

  // Price Display
  ctx.font = '900 84px sans-serif';
  ctx.fillText(`€${Math.round(item.listing_price)}`, 80, 1480);
  
  const mPrice = item.member_price || Math.round(item.listing_price * 0.9);
  ctx.fillStyle = '#EAB308';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(`SOCIETY PRICE: €${mPrice}`, 80, 1540);

  // Status Badge
  ctx.fillStyle = '#10B981';
  roundRect(ctx, 80, 1580, 300, 60, 30);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("ARCHIVE SECURED", 230, 1618);

  // Integrity Badge
  ctx.fillStyle = '#18181B';
  roundRect(ctx, 80, 1680, 920, 160, 40);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText("CONCIERGE SOURCING ACTIVE", 140, 1750);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#A1A1AA';
  ctx.fillText("Neural Network scanning global collections...", 140, 1800);

  // OPTIONAL: Society Popup Simulation
  if (options.showPopup) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, 1080, 1920);
    
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 100;
    roundRect(ctx, 100, 600, 880, 700, 80);
    ctx.fill();
    ctx.shadowColor = "transparent";
    
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = '900 64px sans-serif';
    ctx.fillText("EXCLUSIVE", 540, 750);
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText("Member prices unlocked.", 540, 820);
    
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(200, 950, 680, 120);
    ctx.fillStyle = '#000';
    ctx.font = '900 36px sans-serif';
    ctx.fillText("ENTER THE VAULT", 540, 1025);
  }

  drawIPhoneUI(ctx);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
}

async function generateRealisticScroll(items: any[], filename: string) {
  if (!items || items.length === 0) return;
  console.log(`🎥 Generating Realistic Scroll: ${filename}...`);
  const cardHeight = 1300; 
  const gap = 60;
  const totalHeight = items.length * (cardHeight + gap) + 600;
  const canvas = createCanvas(1080, totalHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 1080, totalHeight);

  let currentY = 300;
  for (const item of items) {
    ctx.fillStyle = '#FFF';
    ctx.shadowColor = "rgba(0,0,0,0.05)";
    ctx.shadowBlur = 40;
    roundRect(ctx, 40, currentY, 1000, 1200, 60);
    ctx.fill();
    ctx.shadowColor = "transparent";

    try {
      const imgBuffer = await fetchAndConvertImage(item.images[0]);
      if (imgBuffer) {
        const img = await loadImage(imgBuffer);
        ctx.save();
        roundRect(ctx, 80, currentY + 40, 920, 800, 50);
        ctx.clip();
        ctx.drawImage(img, 80, currentY + 40, 920, 920);
        ctx.restore();
      }
    } catch(e) {}

    ctx.textAlign = 'left';
    ctx.fillStyle = '#000';
    ctx.font = '900 52px sans-serif';
    const title = item.title.toUpperCase();
    ctx.fillText(title.length > 20 ? title.substring(0, 20) + "..." : title, 100, currentY + 920);
    
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`€${Math.round(item.listing_price)}`, 100, currentY + 1020);

    ctx.fillStyle = '#EAB308';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`SOCIETY: €${item.member_price || Math.round(item.listing_price * 0.9)}`, 100, currentY + 1080);

    currentY += cardHeight + gap;
  }

  const longImagePath = path.join(OUTPUT_DIR, `temp_${filename}.png`);
  fs.writeFileSync(longImagePath, canvas.toBuffer('image/png'));

  const videoPath = path.join(OUTPUT_DIR, filename);
  const scrollDist = totalHeight - 1920;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(longImagePath)
      .loop(15)
      .fps(30)
      .videoFilters([`crop=1080:1920:0:t/15*${scrollDist}`])
      .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-preset ultrafast', '-t', '15'])
      .save(videoPath)
      .on('end', () => {
        if (fs.existsSync(longImagePath)) fs.unlinkSync(longImagePath);
        resolve(true);
      })
      .on('error', (err) => resolve(false));
  });
}

async function runDailyFactory() {
  console.log("🏭 Auvra Realist Content Factory Initializing...");

  const oldFiles = fs.readdirSync(OUTPUT_DIR);
  oldFiles.forEach(f => { if(f !== '.gitkeep') {
    try { fs.unlinkSync(path.join(OUTPUT_DIR, f)); } catch(e) {}
  }});

  const { data: allAvailable } = await supabase
    .from('pulse_inventory')
    .select('*')
    .eq('status', 'available')
    .order('listing_price', { ascending: false });

  if (!allAvailable || allAvailable.length < 20) {
    console.log("❌ Not enough inventory.");
    return;
  }

  // BATCH 1: HIGH TIER (10 Images)
  const highBatch = allAvailable.slice(0, 10);
  for (let i = 0; i < highBatch.length; i++) {
    await generateRealisticScreenshot(highBatch[i], `high_snap_${i}.png`, { showPopup: i === 0 });
  }

  // BATCH 2: MID TIER (10 Images) - Wider range to ensure count
  const midBatch = allAvailable.filter(i => i.listing_price < 800 && i.listing_price > 50).slice(0, 10);
  for (let i = 0; i < midBatch.length; i++) {
    await generateRealisticScreenshot(midBatch[i], `mid_snap_${i}.png`);
  }

  // BATCH 3: MIX TIER (10 Images)
  const mixBatch = allAvailable.sort(() => 0.5 - Math.random()).slice(0, 10);
  for (let i = 0; i < mixBatch.length; i++) {
    await generateRealisticScreenshot(mixBatch[i], `mix_snap_${i}.png`, { showPopup: i === 5 });
  }

  // VIDEOS
  console.log("🎬 Generating 2 Videos...");
  await generateRealisticScroll(highBatch, "video_luxury.mp4");
  await generateRealisticScroll(midBatch, "video_steals.mp4");

  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.mp4'))
    .map(f => path.join(OUTPUT_DIR, f));
  
  if (files.length > 0) {
    await sendTelegramMedia(files, `🏛️ AUVRA REALIST DROP\n\n30 Native Snaps\n2 Motion Scrolls\n\nStatus: 100% Boutique Accuracy`);
  }

  console.log("✅ Daily Drop Sent.");
}

runDailyFactory();
