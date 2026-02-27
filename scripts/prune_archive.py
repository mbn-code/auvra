import os
import requests
import logging
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

def check_item_availability(item):
    """Checks if the source URL is still active."""
    url = item.get('source_url')
    if not url:
        return item['id'], False

    try:
        # We use a GET request to read the page content because many marketplaces
        # return a 200 OK but display "Sold" on the page.
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        
        if response.status_code == 404:
            return item['id'], False
            
        # Check for common "sold" indicators in the HTML
        html_content = response.text.lower()
        if '"sold":true' in html_content or 'item is sold' in html_content or 'status":"sold"' in html_content:
            return item['id'], False
            
        return item['id'], True
    except Exception:
        # If we get a timeout or other error, we don't prune immediately 
        # to avoid false positives on network glitches
        return item['id'], True

def run_pruning():
    logging.info("🧹 Initializing Archive Pruning Protocol...")
    
    # Fetch all items currently marked as available
    try:
        res = supabase.table("pulse_inventory") \
            .select("id, source_url") \
            .eq("status", "available") \
            .execute()
        items = res.data
    except Exception as e:
        logging.error(f"Failed to fetch inventory: {e}")
        return

    if not items:
        logging.info("✅ Archive is already lean. No available items to check.")
        return

    logging.info(f"🔍 Inspecting {len(items)} items for availability...")
    
    to_prune = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = list(tqdm(executor.map(check_item_availability, items), total=len(items), desc="Pruning Mesh"))
        
        for item_id, is_available in results:
            if not is_available:
                to_prune.append(item_id)

    if to_prune:
        logging.info(f"🔥 Pruning {len(to_prune)} dead nodes from the archive...")
        # Update status to 'sold' or 'unavailable' in batches
        for i in range(0, len(to_prune), 100):
            batch = to_prune[i:i+100]
            supabase.table("pulse_inventory") \
                .update({"status": "sold"}) \
                .in_("id", batch) \
                .execute()
        logging.info("✅ Pruning complete.")
    else:
        logging.info("✅ All nodes verified active.")

if __name__ == "__main__":
    run_pruning()
