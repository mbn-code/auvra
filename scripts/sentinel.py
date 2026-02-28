import os
import time
import subprocess
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# --- CONFIGURATION ---
# Load env from the same directory as the script or project root
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(ENV_PATH)

# Supabase Client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    print("Warning: Supabase credentials not found. System command polling will be disabled.")

# Sentinel Settings
LOOP_INTERVAL_SECONDS = 3600  # 1 Hour
COMMAND_POLL_INTERVAL = 60    # 1 Minute
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

def check_system_commands():
    """Polls the Supabase system_commands table for manual triggers from the Admin Dashboard."""
    if not supabase:
        return
    try:
        response = supabase.table("system_commands").select("*").eq("status", "pending").order("created_at").limit(1).execute()
        if response.data and len(response.data) > 0:
            command_record = response.data[0]
            cmd_id = command_record["id"]
            cmd = command_record["command"]
            
            logging.info(f"🔄 Found pending system command: {cmd}")
            supabase.table("system_commands").update({"status": "running"}).eq("id", cmd_id).execute()
            
            shell_command = ""
            if cmd == "pulse":
                shell_command = "npx tsx scripts/pulse-run.ts"
            elif cmd == "sync":
                shell_command = "python3 scripts/neural_sync.py"
            elif cmd == "sync-force":
                shell_command = "python3 scripts/neural_sync.py --force"
            elif cmd == "prune":
                shell_command = "python3 scripts/prune_archive.py"
            elif cmd == "content":
                shell_command = "npx tsx scripts/generate-daily-content.ts"
            else:
                logging.error(f"Unknown command: {cmd}")
                supabase.table("system_commands").update({"status": "failed"}).eq("id", cmd_id).execute()
                return
                
            success = run_command(shell_command, f"System Command: {cmd}")
            
            final_status = "completed" if success else "failed"
            supabase.table("system_commands").update({"status": final_status}).eq("id", cmd_id).execute()
            
    except Exception as e:
        logging.error(f"Error checking system commands: {e}")

def sentinel_cycle():
    """One full execution loop of the Auvra automated pipeline."""
    logging.info("--- STARTING NEW SENTINEL CYCLE ---")
    
    # 1. Update Codebase
    run_command("git pull", "Git Auto-Update")
    
    # 2. Sync Node dependencies (if package.json changed)
    run_command("npm install", "NPM Dependencies Sync")
    
    # 3. Scrape Marketplace (Pulse Hunt)
    run_command("npx tsx scripts/pulse-run.ts", "Marketplace Pulse Hunt")
    
    # 4. Neural DNA Sync
    run_command("python3 scripts/neural_sync.py", "Neural Latent Space Sync")
    
    # 5. Prune Dead Links
    run_command("python3 scripts/prune_archive.py", "Mesh Integrity Pruning")
    
    # 6. Content Generation
    run_command("npx tsx scripts/generate-daily-content.ts", "Social Asset Generation")
    
    logging.info("--- CYCLE COMPLETE. SLEEPING... ---")
    notify_telegram("Cycle Complete. Archive is healthy and synced.")

if __name__ == "__main__":
    notify_telegram("System Online. Monitoring Auvra Mesh.")
    
    # Force an immediate cycle on startup, or just wait for the loop. We will wait for the loop logic.
    # We will pretend last cycle was a long time ago.
    last_cycle_time = 0
    
    while True:
        current_time = time.time()
        try:
            # 1. Run the hourly cycle if it's time
            if current_time - last_cycle_time >= LOOP_INTERVAL_SECONDS:
                sentinel_cycle()
                last_cycle_time = time.time()
            
            # 2. Check for manual commands triggered from the UI
            check_system_commands()
            
        except Exception as e:
            logging.critical(f"SENTINEL CRASHED: {e}")
            notify_telegram(f"CRITICAL SYSTEM FAILURE: {e}")
        
        # Sleep for a short interval before polling again
        time.sleep(COMMAND_POLL_INTERVAL)
