#!/bin/bash

# Auvra Sentinel - Raspberry Pi 4 (64-bit) Environment Setup
# This script installs all necessary system dependencies for Auvra.

echo "🚀 Starting Auvra Environment Setup..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Python & Build Tools
echo "📦 Installing Python and Build Tools..."
sudo apt install -y python3-pip python3-venv ffmpeg libgl1 build-essential

# 3. Install Node.js 20 (LTS)
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Setup Python Virtual Environment
echo "🐍 Setting up Python Virtual Environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 5. Setup Node Dependencies
echo "📦 Installing Node Dependencies & Playwright..."
npm install
npx playwright install --with-deps chromium

# 6. Create Logs Directory
mkdir -p logs

echo "✅ Setup Complete!"
echo "-------------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Create a .env.local file with your secrets."
echo "2. Run 'source venv/bin/activate' to enter the environment."
echo "3. Run 'python3 scripts/sentinel.py' to start the loop."
echo "-------------------------------------------------------"
