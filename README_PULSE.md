# Auvra Pulse: Raspberry Pi Setup Guide

This guide will help you set up the **Predator Algorithm** on your Raspberry Pi to scan Vinted 24/7.

## 1. Prerequisites
Ensure you have Node.js (v18+) installed on your Pi.

## 2. Install Dependencies
Run these commands in the project folder on your Pi:
```bash
npm install
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
To run a full cycle of all 29 brands:
```bash
npx tsx scripts/pulse-run.ts
```

## 5. Automation (Crontab)
To make it run every hour automatically, open your crontab:
```bash
crontab -e
```
Add this line at the bottom:
```cron
0 * * * * cd /path/to/auvra && /usr/local/bin/npx tsx scripts/pulse-run.ts >> /home/pi/pulse.log 2>&1
```

## 6. Admin Review
Log into your website at `/admin/review` to see items flagged by the algorithm.
- **Green Score:** Safe to auto-post.
- **Orange Score:** Potential fake or unusual price, requires your manual "Approve".
