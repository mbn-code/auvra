# Auvra Pulse: Raspberry Pi Setup Guide

This guide will help you set up the **Predator Algorithm** on your Raspberry Pi to scan Vinted 24/7.

## 1. Prerequisites
Ensure you have Node.js (v18+) installed on your Pi.

## 2. Install Dependencies
Run these commands in the project folder on your Pi:
```bash
npm install
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
npx playwright install-deps
npx playwright install chromium
```

## 3. Environment Variables
Create a `.env.local` file on your Pi with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cfyqifaaveryrbunknaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CLOUDINARY_CLOUD_NAME=dvdjz4igb
CLOUDINARY_API_KEY=799968242112243
CLOUDINARY_API_SECRET=your_cloudinary_secret_here
PUSHOVER_USER_KEY=umv3rx6n3r4kwwwnsdpkygsaa6svof
PUSHOVER_TOKEN=a3hmnaorgc4b83qf5wchi8hm62fdi3
```

## 4. Running the Algorithm
To run the full sentinel daemon:
```bash
python3 scripts/sentinel.py
```

To manually run a marketplace scrape only:
```bash
npx tsx scripts/pulse-run.ts
```

## 5. Automation
Run `scripts/sentinel.py` under `systemd`, `pm2`, or `screen` so it can poll commands every minute and trigger its full cycle on schedule.

## 6. Admin Review
Log into your website at `/admin/review` to see items flagged by the algorithm.
- **Green Score:** Safe to auto-post.
- **Orange Score:** Potential fake or unusual price, requires your manual "Approve".
