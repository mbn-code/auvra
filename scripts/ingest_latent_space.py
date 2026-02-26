import os
import glob
import time
import logging
from pathlib import Path
from PIL import Image
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

# --- CONFIGURATION ---
IMAGE_DIR = "/home/mbn/Downloads/archive/fashion-dataset/images"
BATCH_SIZE = 64
CDN_BASE_URL = "https://cdn.mbn-code.dk/"
MODEL_NAME = 'clip-ViT-B-32'

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("ingestion.log"),
        logging.StreamHandler()
    ]
)

# Load Environment
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Missing Supabase credentials in environment.")
    exit(1)

# Initialize CLIP and Supabase
logging.info(f"🚀 Loading {MODEL_NAME}...")
try:
    model = SentenceTransformer(MODEL_NAME)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logging.error(f"Initialization Failed: {e}")
    exit(1)

def get_existing_urls():
    """Fetches all existing image URLs from Supabase to prevent duplicates."""
    logging.info("🔍 Fetching existing image URLs for deduplication...")
    existing = set()
    try:
        # Fetching in chunks to handle potential result limits
        page_size = 5000
        offset = 0
        while True:
            response = supabase.table("style_latent_space") \
                .select("image_url") \
                .range(offset, offset + page_size - 1) \
                .execute()
            
            urls = [item['image_url'] for item in response.data]
            if not urls:
                break
            existing.update(urls)
            offset += page_size
            logging.info(f"   Found {len(existing)} records so far...")
    except Exception as e:
        logging.warning(f"⚠️ Could not fetch existing URLs (Table might be empty): {e}")
    
    return existing

def ingest():
    existing_urls = get_existing_urls()
    
    # Find all images
    image_paths = glob.glob(os.path.join(IMAGE_DIR, "*.jpg")) + \
                  glob.glob(os.path.join(IMAGE_DIR, "*.jpeg")) + \
                  glob.glob(os.path.join(IMAGE_DIR, "*.png"))
    
    total_images = len(image_paths)
    logging.info(f"📂 Found {total_images} local images. Filtering for ingestion...")

    # Filter out already ingested images
    pending_paths = []
    for p in image_paths:
        cdn_url = f"{CDN_BASE_URL}{Path(p).with_suffix('.webp').name}"
        if cdn_url not in existing_urls:
            pending_paths.append(p)

    total_pending = len(pending_paths)
    logging.info(f"✨ {total_pending} images are new. Starting high-performance ingestion...")

    if total_pending == 0:
        logging.info("🏁 No new images to ingest.")
        return

    # Process in optimized batches
    for i in tqdm(range(0, total_pending, BATCH_SIZE), desc="Neural Latent Ingestion"):
        batch_paths = pending_paths[i:i + BATCH_SIZE]
        batch_images = []
        valid_data = []

        for path in batch_paths:
            try:
                # Open and convert to RGB
                img = Image.open(path).convert("RGB")
                batch_images.append(img)
                
                # Metadata
                cdn_url = f"{CDN_BASE_URL}{Path(path).with_suffix('.webp').name}"
                valid_data.append({
                    "image_url": cdn_url,
                    "source": "fashion-dataset",
                    "archetype": "general" # Can be refined later based on attributes.csv
                })
            except Exception as e:
                logging.error(f"❌ Failed to load {path}: {e}")
                continue

        if not batch_images:
            continue

        try:
            # Generate Embeddings (CLIP 512-dim)
            embeddings = model.encode(batch_images, show_progress_bar=False)

            # Map embeddings to data
            for j, emb in enumerate(embeddings):
                valid_data[j]["embedding"] = emb.tolist()

            # Batch Upsert to Supabase
            supabase.table("style_latent_space").upsert(valid_data).execute()
            
        except Exception as e:
            logging.error(f"🔥 Batch Failed at offset {i}: {e}")
            time.sleep(2) 
            continue

    logging.info("🏁 Ingestion Process Complete.")

if __name__ == "__main__":
    ingest()
