import os
import sys
import io
import logging
import requests
import time
from PIL import Image
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

# --- CONFIGURATION ---
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BATCH_SIZE = 15
MODEL_NAME = 'clip-ViT-B-32'

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("neural_sync.log"),
        logging.StreamHandler()
    ]
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials.")
    exit(1)

# Initialize CLIP and Supabase
logging.info(f"🚀 Initializing Auvra Neural Sync ({MODEL_NAME})...")
try:
    model = SentenceTransformer(MODEL_NAME)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logging.error(f"Initialization Failed: {e}")
    exit(1)

def fetch_inventory_to_sync():
    """Fetches all sold and available inventory items."""
    try:
        # We need id, images, and category (for archetype)
        response = supabase.table("pulse_inventory") \
            .select("id, images, category, style_embedding") \
            .or_("status.eq.available,status.eq.sold") \
            .execute()
        return response.data
    except Exception as e:
        logging.error(f"Failed to fetch inventory: {e}")
        return []

def get_synced_product_ids():
    """Fetches already synced product IDs from latent space."""
    try:
        response = supabase.table("style_latent_space").select("product_id").execute()
        return {item['product_id'] for item in response.data}
    except Exception as e:
        logging.warning(f"Could not fetch synced IDs: {e}")
        return set()

def process_item(item: Dict[str, Any]):
    """Downloads image and generates embedding."""
    images = item.get("images", [])
    if not images or not isinstance(images, list):
        return None

    image_url = images[0]
    
    # 1. Fetch image
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()
    
    # 2. Process image
    img = Image.open(io.BytesIO(response.content)).convert("RGB")
    
    # 3. Generate Vector
    embedding = model.encode(img, show_progress_bar=False)
    return embedding.tolist(), image_url

def sync(force=False):
    inventory = fetch_inventory_to_sync()
    synced_ids = get_synced_product_ids()
    
    if force:
        pending = inventory
    else:
        pending = [item for item in inventory if item['id'] not in synced_ids]
    
    total = len(pending)
    logging.info(f"🧬 Total Inventory: {len(inventory)} | Already Synced: {len(synced_ids)}")
    logging.info(f"🔥 Starting sync for {total} items (force={force})...")

    if total == 0:
        logging.info("✅ Neural alignment complete. All items synced.")
        return

    # Process in batches
    for i in range(0, total, BATCH_SIZE):
        batch = pending[i:i + BATCH_SIZE]
        latent_batch = []
        
        for item in tqdm(batch, desc=f"Syncing Batch {i//BATCH_SIZE + 1}"):
            product_id = item['id']
            try:
                # 1. Generate DNA
                result = process_item(item)
                if not result:
                    continue
                
                embedding, image_url = result
                
                # 2. Prep Latent Space Entry
                if force and product_id in synced_ids:
                    # Update existing in latent space
                    supabase.table("style_latent_space").update({
                        "embedding": embedding,
                        "image_url": image_url,
                        "archetype": item.get('category', 'general')
                    }).eq("product_id", product_id).execute()
                else:
                    latent_batch.append({
                        "product_id": product_id,
                        "image_url": image_url,
                        "embedding": embedding,
                        "archetype": item.get('category', 'general'),
                        "source": "Auvra_Internal_Archive"
                    })
                
                # 3. Update pulse_inventory style_embedding if missing or force
                if force or not item.get('style_embedding'):
                    supabase.table("pulse_inventory") \
                        .update({"style_embedding": embedding}) \
                        .eq("id", product_id) \
                        .execute()

            except Exception as e:
                logging.error(f"❌ Failed Item {product_id}: {e}")
                continue

        if latent_batch:
            try:
                supabase.table("style_latent_space").insert(latent_batch).execute()
            except Exception as e:
                logging.error(f"🔥 Batch Insert Failed: {e}")
                time.sleep(2)

    logging.info("🏁 Recursive Neural Sync Complete.")

if __name__ == "__main__":
    force_sync = '--force' in sys.argv
    sync(force=force_sync)
