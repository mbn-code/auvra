import os
import requests
import logging
from logging.handlers import RotatingFileHandler
import re
import random
import time
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# --- CONFIGURATION ---
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
MAX_WORKERS = 5 # Reduced parallel checks to avoid IP bans

# Configure Logging with Rotation
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        RotatingFileHandler("logs/pruner.log", maxBytes=5*1024*1024, backupCount=3),
        logging.StreamHandler()
    ]
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Robust Session with Retries
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1.5,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)
session.mount('http://', HTTPAdapter(max_retries=retries))
session.mount('https://', HTTPAdapter(max_retries=retries))

# Anti-ban: Rotating User Agents
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
]

def extract_price(html_content):
    # Try OpenGraph price amount (works for Grailed and often Vinted)
    match = re.search(r'<meta\s+(?:property|name)="[^"]*price:amount"\s+content="([0-9\.]+)"', html_content)
    if match:
        return float(match.group(1))
    
    # Try Vinted specific JSON embedded data: "amount":"150.00" or similar
    match = re.search(r'"price"\s*:\s*\{\s*"amount"\s*:\s*"([0-9\.]+)"', html_content)
    if match:
        return float(match.group(1))

    # Try common JSON-LD or script schemas
    match = re.search(r'"price"\s*:\s*"([0-9\.]+)"', html_content)
    if match:
        return float(match.group(1))
        
    return None

def check_item_availability(item):
    """Checks if the source URL is still active and extracts latest price."""
    url = item.get('source_url')
    if not url:
        return item['id'], False, None
        
    # Anti-ban execution jitter per request thread
    time.sleep(random.uniform(0.5, 2.5))

    try:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Upgrade-Insecure-Requests': '1'
        }
        
        response = session.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        if response.status_code == 404:
            return item['id'], False, None
            
        # Check for common "sold" indicators in the HTML
        html_content = response.text.lower()
        if '"sold":true' in html_content or 'item is sold' in html_content or 'status":"sold"' in html_content:
            return item['id'], False, None

        # Extract the current price
        current_price = extract_price(response.text)
            
        return item['id'], True, current_price
    except Exception as e:
        # Avoid logging every timeout, but handle it gracefully
        # If we get a timeout or other error, we don't prune immediately 
        # to avoid false positives on network glitches or IP bans
        return item['id'], True, None

def run_pruning():
    logging.info("🧹 Initializing Archive Pruning & Pricing Protocol...")
    
    # Fetch all items currently marked as available
    try:
        res = supabase.table("pulse_inventory") \
            .select("id, source_url, listing_price") \
            .eq("status", "available") \
            .execute()
        items = res.data
    except Exception as e:
        logging.error(f"Failed to fetch inventory: {e}")
        return

    if not items:
        logging.info("✅ Archive is already lean. No available items to check.")
        return

    logging.info(f"🔍 Inspecting {len(items)} items for availability and price changes...")
    
    to_prune = []
    to_update_price = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = list(tqdm(executor.map(check_item_availability, items), total=len(items), desc="Pruning & Pricing Mesh"))
        
        # We need to map results back to their original items to compare prices
        item_map = {item.get('id'): item for item in items if isinstance(item, dict) and item.get('id')}
        
        for item_id, is_available, current_price in results:
            if not is_available:
                to_prune.append(item_id)
            elif current_price is not None and item_id in item_map:
                original_price_raw = item_map[item_id].get('listing_price')
                # If price differs significantly (more than 1 unit to avoid rounding issues)
                try:
                    original_price = float(str(original_price_raw)) if original_price_raw is not None else None
                    if original_price is not None and abs(original_price - current_price) > 1.0:
                        to_update_price.append((item_id, current_price))
                except (ValueError, TypeError):
                    pass

    if to_prune:
        logging.info(f"🔥 Pruning {len(to_prune)} dead nodes from the archive...")
        # Update status to 'sold' or 'unavailable' in batches
        for i in range(0, len(to_prune), 100):
            batch = to_prune[i:i+100]
            try:
                # Add retry loop for DB updates
                for attempt in range(3):
                    try:
                        supabase.table("pulse_inventory").update({"status": "sold"}).in_("id", batch).execute()
                        break
                    except Exception as db_e:
                        if attempt == 2: raise
                        time.sleep(2 ** attempt)
            except Exception as e:
                logging.error(f"Failed batch prune update: {e}")
                
    if to_update_price:
        logging.info(f"💰 Updating prices for {len(to_update_price)} nodes...")
        for item_id, new_price in to_update_price:
            try:
                for attempt in range(3):
                    try:
                        supabase.table("pulse_inventory").update({
                            "listing_price": new_price,
                            "source_price": new_price
                        }).eq("id", item_id).execute()
                        break
                    except Exception as db_e:
                        if attempt == 2: raise
                        time.sleep(1) # short backoff
            except Exception as e:
                logging.error(f"Failed to update price for {item_id}: {e}")

    if not to_prune and not to_update_price:
        logging.info("✅ All nodes verified active with accurate pricing.")
    else:
        logging.info("✅ Pruning and pricing complete.")

if __name__ == "__main__":
    run_pruning()