// Temporary script to fetch chat ID
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getChatId() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to fetch updates:", e);
  }
}

getChatId();
