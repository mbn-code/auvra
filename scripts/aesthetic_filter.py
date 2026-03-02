import os
import time
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

# Load environment variables
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize CLIP model for aesthetic verification
print("Loading CLIP model...")
model = SentenceTransformer('clip-ViT-B-32')

# Aesthetic parameters (target concepts)
TARGET_AESTHETICS = [
    "avant-garde fashion", 
    "archive fashion", 
    "gorpcore outdoor wear", 
    "y2k streetwear", 
    "high fashion runway",
    "minimalist luxury",
    "vintage designer clothing"
]
target_embeddings = model.encode(TARGET_AESTHETICS)

# Threshold for acceptance
AESTHETIC_THRESHOLD = 0.22

def process_unverified_assets():
    print("Fetching unverified assets...")
    response = supabase.table('unverified_assets').select('*').eq('status', 'pending').limit(50).execute()
    assets = response.data
    
    if not assets:
        print("No pending assets found.")
        return

    for asset in assets:
        try:
            image_url = asset['images'][0]
            print(f"Processing {asset['id']} - {asset['title']}")
            
            # Download image
            img_response = requests.get(image_url, timeout=10)
            img = Image.open(BytesIO(img_response.content)).convert("RGB")
            
            # Encode image
            img_embedding = model.encode(img)
            
            # Calculate similarities against targets
            # Since we use SentenceTransformer, cosine similarity is just dot product if normalized
            from sentence_transformers.util import cos_sim
            similarities = cos_sim(img_embedding, target_embeddings)[0]
            max_sim = float(max(similarities))
            
            print(f"Max Aesthetic Score: {max_sim:.4f}")
            
            if max_sim >= AESTHETIC_THRESHOLD:
                print("✅ Approved!")
                
                # Insert into pulse_inventory
                insert_data = {
                    'vinted_id': asset['vinted_id'],
                    'brand': asset['brand'],
                    'title': asset['title'],
                    'source_url': asset['source_url'],
                    'source_price': asset['source_price'],
                    'listing_price': asset['listing_price'],
                    'images': asset['images'],
                    'category': asset['category'],
                    'locale': asset['locale'],
                    'shipping_zone': asset['shipping_zone'],
                    'status': 'available',
                    'style_embedding': img_embedding.tolist() # Pre-calculate vector!
                }
                
                if 'submitted_by_user_id' in asset and asset['submitted_by_user_id']:
                    insert_data['submitted_by_user_id'] = asset['submitted_by_user_id']

                supabase.table('pulse_inventory').insert(insert_data).execute()
                
                # Mark as approved
                supabase.table('unverified_assets').update({'status': 'approved'}).eq('id', asset['id']).execute()
            else:
                print("❌ Rejected.")
                # Mark as rejected
                supabase.table('unverified_assets').update({'status': 'rejected'}).eq('id', asset['id']).execute()
                
        except Exception as e:
            print(f"Error processing asset {asset['id']}: {e}")
            supabase.table('unverified_assets').update({'status': 'error'}).eq('id', asset['id']).execute()

if __name__ == "__main__":
    process_unverified_assets()
