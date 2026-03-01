// Auvra Pulse: Master Execution Script
import { scrapeVinted } from './predator';
import { scrapeGrailed } from './grailed';
import { saveToSupabase } from './lib/inventory';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

dotenv.config({ path: '.env.local' });

// --- CONFIGURATION & LOGGING ---
const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/pulse-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '3d' // Keep logs for 3 days to save SD card space
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    transport,
    new winston.transports.Console()
  ]
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BRANDS = [
  "Louis Vuitton", "Chrome Hearts", "Canada Goose", "Syna World", 
  "Corteiz", "Moncler", "Hermès", "Chanel", "CP Company", "ASICS", 
  "Supreme", "Lacoste", "Zara", "Prada", "Essentials", "Burberry", 
  "Timberland", "Ralph Lauren", "Amiri", "Sp5der", "Stüssy", 
  "A Bathing Ape", "Broken Planet", "Denim Tears", "Hellstar", 
  "Eric Emanuel", "Gallery Dept", "Stone Island", "Patagonia", 
  "New Balance", "Salomon", "Oakley", "Dickies", "Diesel", "Levis", 
  "Adidas", "Nike", "Gucci", "New Era", "MLB", "Takashi Murakami"
];

const LOCALES = ["dk", "de", "pl", "se", "fi"];

// --- UTILITIES ---
/** 
 * Sleep with randomized jitter to prevent rate-limiting and bans 
 */
const sleepJitter = async (minMs: number, maxMs: number) => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Executes a promise-returning function with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  baseDelayMs: number = 2000,
  context: string = 'Operation'
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === retries) {
        logger.error(`❌ ${context} failed after ${retries} attempts: ${error.message}`);
        return null;
      }
      
      const backoffDelay = baseDelayMs * Math.pow(2, attempt - 1);
      // Add up to 30% jitter to the backoff delay
      const jitterDelay = backoffDelay + (Math.random() * backoffDelay * 0.3);
      
      logger.warn(`⚠️ ${context} failed (Attempt ${attempt}/${retries}). Retrying in ${Math.round(jitterDelay)}ms... Error: ${error.message}`);
      await new Promise(r => setTimeout(r, jitterDelay));
    }
  }
  return null;
}


async function checkHuntQueue() {
  try {
    const { data: queue, error } = await supabase
      .from('hunt_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(1);

    if (error) {
      logger.error(`Supabase DB Error reading hunt queue: ${error.message}`);
      return null;
    }
    if (!queue || queue.length === 0) return null;
    return queue[0];
  } catch (error: any) {
    logger.error(`Failed to check hunt queue: ${error.message}`);
    return null;
  }
}

async function runPulseCycle() {
  const args = process.argv.slice(2);
  let targetBrands = args.length > 0 ? args : null;

  // 0. Check for user-requested hunts first
  const hunt = await checkHuntQueue();
  if (hunt) {
    logger.info(`[Hunt] User requested deep hunt for: ${hunt.brands.join(', ')}`);
    targetBrands = hunt.brands;
    
    await withRetry(async () => {
      const { error } = await supabase
        .from('hunt_queue')
        .update({ status: 'hunting', last_hunt_at: new Date().toISOString() })
        .eq('id', hunt.id);
      if (error) throw new Error(error.message);
    }, 3, 1000, 'Update Hunt Status');
  }

  logger.info(`🚀 Starting ${targetBrands ? 'Targeted Hunt' : 'Global Pulse Cycle'}...`);

  const brandsToRun = targetBrands || BRANDS;
  
  for (const brand of brandsToRun) {
    try {
      // Vinted Hunt - Cycle through locales for more results
      for (const locale of LOCALES) {
        const vintedItems = await withRetry(
          () => scrapeVinted(brand, locale),
          3, 
          2000, 
          `Vinted Scrape [${brand} - ${locale}]`
        );
        
        if (vintedItems && vintedItems.length > 0) {
          logger.info(`📦 ${brand}: Scraped ${vintedItems.length} items from Vinted.${locale}`);
          for (const item of vintedItems) {
            await withRetry(() => saveToSupabase(item), 2, 500, `Save Vinted Item (${(item as any).id || 'unknown'})`);
          }
        }
        
        // Jitter between locale requests (1.5s to 4s) to avoid rate limits
        if (targetBrands) await sleepJitter(1500, 4000);
      }

      // Grailed Hunt
      const grailedItems = await withRetry(
        () => scrapeGrailed(brand),
        3,
        2500,
        `Grailed Scrape [${brand}]`
      );
      
      if (grailedItems && grailedItems.length > 0) {
        logger.info(`📦 ${brand}: Scraped ${grailedItems.length} items from Grailed`);
        for (const item of grailedItems) {
            await withRetry(() => saveToSupabase(item), 2, 500, `Save Grailed Item (${(item as any).id || 'unknown'})`);
        }
      }
      
    } catch (e: any) {
      logger.error(`💥 Failed cycle for ${brand}: ${e.message}`);
    }
    
    // Major Jitter between brand blocks (3s to 8s) to avoid network bans
    if (!targetBrands) {
        logger.info(`⏳ Jitter sleep before next brand...`);
        await sleepJitter(3000, 8000);
    }
  }

  if (hunt) {
    await withRetry(async () => {
      const { error } = await supabase.from('hunt_queue').update({ status: 'completed' }).eq('id', hunt.id);
      if (error) throw new Error(error.message);
    }, 3, 1000, 'Complete Hunt Status');
  }

  logger.info(`✅ Cycle Complete.`);
}

runPulseCycle();
