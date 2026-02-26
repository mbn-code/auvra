import os
import sqlite3
import logging
from ftplib import FTP, error_perm
from PIL import Image
from tqdm import tqdm
from pathlib import Path
import io

# --- CONFIGURATION ---
SOURCE_DIR = "/home/mbn/Downloads/archive/fashion-dataset/images"
DB_PATH = "upload_registry.db"
MAX_WIDTH = 800
WEBP_QUALITY = 80

# FTP Credentials
FTP_HOST = "pro02.azehosting.net"
FTP_USER = "nbgruppe"
FTP_PASS = "h4HQ-AwcjW720]"
FTP_PORT = 21
FTP_DIR = "cdn.mbn-code.dk"

# --- LOGGING & STATE ---
logging.basicConfig(level=logging.INFO, filename="uploader.log", format="%(asctime)s - %(message)s")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS uploads (filename TEXT PRIMARY KEY, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    return conn

def is_uploaded(conn, filename):
    cursor = conn.execute("SELECT 1 FROM uploads WHERE filename = ?", (filename,))
    return cursor.fetchone() is not None

def mark_as_uploaded(conn, filename):
    conn.execute("INSERT INTO uploads (filename) VALUES (?)", (filename,))
    conn.commit()

# --- IMAGE PROCESSING ---
def process_image(file_path):
    """Resizes and converts image to WebP buffer."""
    with Image.open(file_path) as img:
        img = img.convert("RGB")
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / float(img.width)
            new_height = int(float(img.height) * float(ratio))
            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
        
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
        buffer.seek(0)
        return buffer

# --- CORE UPLOADER ---
def run_upload(test_mode=False):
    conn = init_db()
    
    source_path = Path(SOURCE_DIR)
    if not source_path.exists():
        print(f"❌ Error: Source directory {SOURCE_DIR} not found.")
        return

    files = list(source_path.glob("*.jpg")) + list(source_path.glob("*.jpeg")) + list(source_path.glob("*.png"))
    print(f"🚀 Found {len(files)} local images. Initializing FTP...")

    try:
        ftp = FTP()
        ftp.connect(FTP_HOST, FTP_PORT)
        ftp.login(FTP_USER, FTP_PASS)
        
        try:
            ftp.cwd(FTP_DIR)
        except error_perm:
            print(f"⚠️ Warning: Could not CWD to {FTP_DIR}, staying in root.")

        count = 0
        for file_path in tqdm(files, desc="Neural Image Ingestion"):
            filename = file_path.name
            webp_filename = file_path.with_suffix(".webp").name

            if is_uploaded(conn, filename):
                continue

            try:
                image_buffer = process_image(file_path)
                ftp.storbinary(f"STOR {webp_filename}", image_buffer)
                mark_as_uploaded(conn, filename)
                count += 1

                if test_mode:
                    print(f"\n✅ Test Upload Successful: {webp_filename}")
                    print(f"🔗 Check it at: https://cdn.mbn-code.dk/{webp_filename}")
                    break

            except Exception as e:
                logging.error(f"Failed to process {filename}: {str(e)}")
                continue

        ftp.quit()
        print(f"🏁 Finished. Uploaded {count} new images.")

    except Exception as e:
        print(f"🔥 FTP Connection Error: {e}")

if __name__ == "__main__":
    import sys
    is_test = "--test" in sys.argv
    run_upload(test_mode=is_test)
