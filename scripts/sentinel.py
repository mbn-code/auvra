import os
import time
import subprocess
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

# --- CONFIGURATION ---
# Load env from the same directory as the script or project root
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(ENV_PATH)

# Sentinel Settings
LOOP_INTERVAL_SECONDS = 3600  # 1 Hour
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [SENTINEL] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler("sentinel.log"),
        logging.StreamHandler()
    ]
)

def notify_telegram(message: str):
    """Sends a status update to the admin Telegram."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": f"🛡️ Auvra Sentinel: {message}"})
    except Exception as e:
        logging.error(f"Telegram Notify Failed: {e}")

def run_command(command: str, description: str):
    """Executes a shell command and logs output."""
    logging.info(f"▶️ Starting: {description}")
    start_time = time.time()
    
    try:
        # Use shell=True to handle npx/pip etc easily
        process = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        duration = round(time.time() - start_time, 2)
        logging.info(f"✅ Completed: {description} ({duration}s)")
        return True
    except subprocess.CalledProcessError as e:
        error_msg = f"❌ FAILED: {description}\nError: {e.stderr[:200]}"
        logging.error(error_msg)
        notify_telegram(error_msg)
        return False

def sentinel_cycle():
    """One full execution loop of the Auvra automated pipeline."""
    logging.info("--- STARTING NEW SENTINEL CYCLE ---")
    
    # 1. Update Codebase
    run_command("git pull", "Git Auto-Update")
    
    # 2. Sync Node dependencies (if package.json changed)
    run_command("npm install", "NPM Dependencies Sync")
    
    # 3. Scrape Marketplace (Pulse Hunt)
    # Using npx tsx to execute the typescript scraper directly
    run_command("npx tsx scripts/pulse-run.ts", "Marketplace Pulse Hunt")
    
    # 4. Neural DNA Sync
    # Loads CLIP model, processes images, then closes to free RAM
    run_command("python3 scripts/neural_sync.py", "Neural Latent Space Sync")
    
    # 5. Prune Dead Links
    run_command("python3 scripts/prune_archive.py", "Mesh Integrity Pruning")
    
    # 6. Content Generation
    run_command("npx tsx scripts/generate-daily-content.ts", "Social Asset Generation")
    
    logging.info("--- CYCLE COMPLETE. SLEEPING... ---")
    notify_telegram("Cycle Complete. Archive is healthy and synced.")

if __name__ == "__main__":
    notify_telegram("System Online. Monitoring Auvra Mesh.")
    
    while True:
        try:
            sentinel_cycle()
        except Exception as e:
            logging.critical(f"SENTINEL CRASHED: {e}")
            notify_telegram(f"CRITICAL SYSTEM FAILURE: {e}")
        
        time.sleep(LOOP_INTERVAL_SECONDS)
