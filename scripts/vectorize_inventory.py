import os
import io
import logging
import requests
from PIL import Image
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

# --- CONFIGURATION ---
# Load environment variables
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BATCH_SIZE = 20
MODEL_NAME = 'clip-ViT-B-32'

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("vectorize_inventory.log"),
        logging.StreamHandler()
    ]
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials in environment variables.")
    exit(1)

# Initialize Supabase and CLIP
logging.info(f"🚀 Initializing {MODEL_NAME} and Supabase Client...")
try:
    model = SentenceTransformer(MODEL_NAME)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logging.error(f"Initialization failed: {e}")
    exit(1)

def fetch_unvectorized_items() -> List[Dict[str, Any]]:
    """Fetch items that need DNA (embedding) and are available."""
    try:
        response = supabase.table("pulse_inventory") \
            .select("id, images") \
            .is_("style_embedding", "null") \
            .eq("status", "available") \
            .execute()
        return response.data
    except Exception as e:
        logging.error(f"Failed to fetch items: {e}")
        return []

def process_item(item: Dict[str, Any]) -> List[float]:
    """Downloads first image and generates embedding."""
    images = item.get("images", [])
    if not images or not isinstance(images, list):
        raise ValueError("No valid images found for item.")

    image_url = images[0]
    
    # Fetch image into memory
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()
    
    # Open and convert
    img = Image.open(io.BytesIO(response.content)).convert("RGB")
    
    # Generate 512-dim vector
    embedding = model.encode(img, show_progress_bar=False)
    return embedding.tolist()

def run_vectorization():
    items = fetch_unvectorized_items()
    total = len(items)
    
    if total == 0:
        logging.info("✅ All available inventory items already have style DNA. Nothing to do.")
        return

    logging.info(f"🧬 Found {total} items needing vectorization. Processing in batches of {BATCH_SIZE}...")
    
    # Process in batches
    for i in range(0, total, BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]
        logging.info(f"Processing batch {i//BATCH_SIZE + 1}...")
        
        for item in tqdm(batch, desc="Vectorizing Batch"):
            item_id = item["id"]
            try:
                # 1. Generate DNA
                embedding = process_item(item)
                
                # 2. Update Supabase
                supabase.table("pulse_inventory") \
                    .update({"style_embedding": embedding}) \
                    .eq("id", item_id) \
                    .execute()
                
            except requests.exceptions.RequestException as re:
                logging.warning(f"⚠️ Network error for Item {item_id}: {re}")
            except Exception as e:
                logging.error(f"❌ Failed to process Item {item_id}: {e}")
                continue

    logging.info("🏁 Inventory vectorization complete.")

if __name__ == "__main__":
    run_vectorization()
