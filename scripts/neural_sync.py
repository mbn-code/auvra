import os
import sys
import io
import logging
from logging.handlers import RotatingFileHandler
import requests
import time
import subprocess
from PIL import Image
from typing import List, Dict, Any, Optional, Set
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def check_ml_available():
    """
    Safely checks if sentence_transformers can be imported without crashing.
    On some ARM hardware (like Cortex-A72 Raspberry Pi 4), pre-compiled ML wheels
    may contain instructions (like ARMv8.2-A) that trigger an 'Illegal instruction'
    (SIGILL) and crash the entire Python process. By testing the import in a 
    subprocess, we ensure the main process survives even if the ML library crashes.
    """
    try:
        result = subprocess.run(
            [sys.executable, "-c", "from sentence_transformers import SentenceTransformer"],
            capture_output=True,
            timeout=10
        )
        return result.returncode == 0
    except Exception:
        return False

TORCH_AVAILABLE = check_ml_available()
model = None
SentenceTransformer = None

if TORCH_AVAILABLE:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        TORCH_AVAILABLE = False


if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
BATCH_SIZE = 15
MODEL_NAME = 'clip-ViT-B-32'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        RotatingFileHandler("logs/neural_sync.log", maxBytes=5*1024*1024, backupCount=3),
        logging.StreamHandler()
    ]
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials.")
    sys.exit(1)

def generate_fallback_embedding() -> List[float]:
    """Generate a placeholder embedding when torch is unavailable."""
    import hashlib
    return [float((i * 7 + 13) % 100) / 100.0 for i in range(512)]

# Configure Robust Requests Session
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1.5,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)
session.mount('http://', HTTPAdapter(max_retries=retries))
session.mount('https://', HTTPAdapter(max_retries=retries))

logging.info(f"🚀 Initializing Auvra Neural Sync ({MODEL_NAME})...")
logging.info(f"🔧 PyTorch Available: {TORCH_AVAILABLE}")

supabase: Client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    if TORCH_AVAILABLE:
        try:
            model = SentenceTransformer(MODEL_NAME)
            logging.info("✅ CLIP Model Loaded Successfully")
        except Exception as e:
            logging.warning(f"⚠️ CLIP Model Load Failed: {e}")
            logging.warning("🔄 Falling back to placeholder embeddings")
            TORCH_AVAILABLE = False
    else:
        logging.warning("⚠️ PyTorch not available - using fallback mode")
except Exception as e:
    logging.error(f"Initialization Failed: {e}")
    sys.exit(1)

def fetch_inventory_to_sync() -> List[Any]:
    """Fetches all sold and available inventory items."""
    try:
        response = supabase.table("pulse_inventory") \
            .select("id, images, category, style_embedding") \
            .or_("status.eq.available,status.eq.sold") \
            .execute()
        if response and response.data:
            return response.data
        return []
    except Exception as e:
        logging.error(f"Failed to fetch inventory: {e}")
        return []

def get_synced_product_ids() -> Set[str]:
    """Fetches already synced product IDs from latent space."""
    try:
        response = supabase.table("style_latent_space").select("product_id").execute()
        if response and response.data:
            return {str(item['product_id']) for item in response.data if isinstance(item, dict) and 'product_id' in item}
        return set()
    except Exception as e:
        logging.warning(f"Could not fetch synced IDs: {e}")
        return set()

def process_item(item: Dict[str, Any]) -> Optional[tuple[List[float], str]]:
    """Downloads image and generates embedding."""
    images = item.get("images", [])
    if not images or not isinstance(images, list) or len(images) == 0:
        return None

    image_url = str(images[0])
    
    try:
        response = session.get(image_url, timeout=15)
        response.raise_for_status()
    except Exception as e:
        logging.warning(f"Failed to fetch image {image_url}: {e}")
        if not TORCH_AVAILABLE:
            return generate_fallback_embedding(), image_url
        return None
    
    try:
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as e:
        logging.warning(f"Failed to process image: {e}")
        if not TORCH_AVAILABLE:
            return generate_fallback_embedding(), image_url
        return None
    
    if TORCH_AVAILABLE and model is not None:
        try:
            embedding = model.encode(img, show_progress_bar=False) # type: ignore
            if hasattr(embedding, "tolist"):
                return embedding.tolist(), image_url # type: ignore
            return list(embedding), image_url # type: ignore
        except Exception as e:
            logging.warning(f"Embedding generation failed: {e}")
            return generate_fallback_embedding(), image_url
    else:
        return generate_fallback_embedding(), image_url

def sync(force: bool = False):
    if not TORCH_AVAILABLE:
        logging.warning("⚠️ Neural sync running in FALLBACK mode - embeddings will be placeholders")
    
    inventory = fetch_inventory_to_sync()
    synced_ids = get_synced_product_ids()
    
    if force:
        pending = inventory
    else:
        pending = [item for item in inventory if str(item.get('id', '')) not in synced_ids]
    
    total = len(pending)
    logging.info(f"🧬 Total Inventory: {len(inventory)} | Already Synced: {len(synced_ids)}")
    logging.info(f"🔥 Starting sync for {total} items (force={force})...")

    if total == 0:
        logging.info("✅ Neural alignment complete. All items synced.")
        return

    for i in range(0, total, BATCH_SIZE):
        batch = pending[i:i + BATCH_SIZE]
        latent_batch = []
        
        for item in tqdm(batch, desc=f"Syncing Batch {i//BATCH_SIZE + 1}"):
            product_id = str(item.get('id', ''))
            if not product_id:
                continue
                
            try:
                result = process_item(item)
                if not result:
                    continue
                
                embedding, image_url = result
                
                if force and product_id in synced_ids:
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
                time.sleep(5)
                try:
                    supabase.table("style_latent_space").insert(latent_batch).execute()
                    logging.info("✅ Batch Insert Recovered.")
                except Exception as retry_e:
                    logging.error(f"💥 Batch Insert Failed permanently: {retry_e}")

    logging.info("🏁 Recursive Neural Sync Complete.")

if __name__ == "__main__":
    force_sync = '--force' in sys.argv
    sync(force=force_sync)