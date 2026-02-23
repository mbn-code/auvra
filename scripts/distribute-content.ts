import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getChatId() {
  // If CHAT_ID is not set, try to fetch from Telegram updates
  // This requires you to have messaged the bot at least once
  if (process.env.TELEGRAM_CHAT_ID) return process.env.TELEGRAM_CHAT_ID;

  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`);
    const data = await res.json();
    if (data.result && data.result.length > 0) {
      const chatId = data.result[0].message.chat.id;
      console.log(`✅ Discovered Chat ID: ${chatId}. Add TELEGRAM_CHAT_ID=${chatId} to .env.local`);
      return chatId;
    }
  } catch (e) {
    console.error("Failed to fetch updates:", e);
  }
  return null;
}

export async function sendTelegramMedia(files: string[], caption: string, showSeparator: boolean = true) {
  const chatId = await getChatId();
  if (!chatId) {
    console.error("❌ No Telegram Chat ID found. Message the bot first!");
    return;
  }

  if (showSeparator) {
    // Send separator message first
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const separator = `##############################\n🚀 NEW CONTENT BATCH\n📅 ${date}\n##############################`;
    
    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: separator
        })
      });
    } catch (e) {
      console.error("Telegram Separator Error:", e);
    }
  }

  console.log(`📤 Sending ${files.length} assets to Telegram...`);

  // Send Images as Group (Album)
  const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  const videoFiles = files.filter(f => f.endsWith('.mp4'));

  // Max 10 items per media group
  const chunkedImages = [];
  for (let i = 0; i < imageFiles.length; i += 10) {
    chunkedImages.push(imageFiles.slice(i, i + 10));
  }

  for (const chunk of chunkedImages) {
    const media = chunk.map((file, i) => ({
      type: 'photo',
      media: `attach://${path.basename(file)}`,
      caption: i === 0 ? caption : undefined
    }));

    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('media', JSON.stringify(media));
    
    chunk.forEach(file => {
      const blob = new Blob([fs.readFileSync(file)]);
      formData.append(path.basename(file), blob, path.basename(file));
    });

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
        method: 'POST',
        body: formData
      });
    } catch (e) {
      console.error("Telegram Group Error:", e);
    }
  }

  // Send Videos individually
  for (const video of videoFiles) {
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('video', new Blob([fs.readFileSync(video)]), path.basename(video));
    formData.append('caption', "🎥 Scroll Video");

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: formData
      });
    } catch (e) {
      console.error("Telegram Video Error:", e);
    }
  }
}

export async function uploadToCloudinary(files: string[]) {
  console.log(`☁️ Uploading ${files.length} assets to Cloudinary...`);
  const urls = [];

  for (const file of files) {
    try {
      const res = await cloudinary.uploader.upload(file, {
        folder: "auvra/social-assets",
        resource_type: "auto"
      });
      urls.push({
        url: res.secure_url,
        type: res.resource_type,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error(`Cloudinary Upload Fail for ${file}:`, e);
    }
  }

  // Save to DB for Admin Panel
  if (urls.length > 0) {
    const { error } = await supabase.from('content_assets').insert(urls);
    if (error) console.error("DB Insert Error:", error.message);
    else console.log("✅ Assets synced to Admin Content Board.");
  }
}
