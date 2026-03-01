import os
import requests
import logging
import re
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor

# --- CONFIGURATION ---
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MAX_WORKERS = 10 # Parallel checks

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("pruner.log"),
        logging.StreamHandler()
    ]
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

    try:
        # We use a GET request to read the page content because many marketplaces
        # return a 200 OK but display "Sold" on the page.
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        
        if response.status_code == 404:
            return item['id'], False, None
            
        # Check for common "sold" indicators in the HTML
        html_content = response.text.lower()
        if '"sold":true' in html_content or 'item is sold' in html_content or 'status":"sold"' in html_content:
            return item['id'], False, None

        # Extract the current price
        current_price = extract_price(response.text)
            
        return item['id'], True, current_price
    except Exception:
        # If we get a timeout or other error, we don't prune immediately 
        # to avoid false positives on network glitches
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
            supabase.table("pulse_inventory") \
                .update({"status": "sold"}) \
                .in_("id", batch) \
                .execute()
                
    if to_update_price:
        logging.info(f"💰 Updating prices for {len(to_update_price)} nodes...")
        # Supabase python client doesn't have a bulk update for different rows easily,
        # doing sequentially for now
        for item_id, new_price in to_update_price:
            try:
                supabase.table("pulse_inventory").update({
                    "listing_price": new_price,
                    # We might also want to update source_price since listing_price is source_price for CaaS
                    "source_price": new_price
                }).eq("id", item_id).execute()
            except Exception as e:
                logging.error(f"Failed to update price for {item_id}: {e}")

    if not to_prune and not to_update_price:
        logging.info("✅ All nodes verified active with accurate pricing.")
    else:
        logging.info("✅ Pruning and pricing complete.")

if __name__ == "__main__":
    run_pruning()
