import os
import sys
import io
import json
import requests
from PIL import Image
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv(".env.local")

MODEL_NAME = 'clip-ViT-B-32'

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image URL provided"}))
        return

    image_url = sys.argv[1]
    
    try:
        model = SentenceTransformer(MODEL_NAME)
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        embedding = model.encode(img, show_progress_bar=False).tolist()
        
        print(json.dumps({"embedding": embedding}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
