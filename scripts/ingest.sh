#!/bin/bash

# Auvra Latent Space Ingestion Wrapper
# This script ensures the Python environment is ready and runs the ingestion.

echo "🚀 Preparing Auvra Ingestion Environment..."

# 1. Check for Python
if ! command -v python3 &> /dev/null
then
    echo "❌ Error: Python 3 is not installed. Please install it to continue."
    exit
fi

# 2. Check for .env or .env.local file
if [ -f .env.local ]; then
    ENV_FILE=".env.local"
elif [ -f .env ]; then
    ENV_FILE=".env"
else
    echo "❌ Error: Neither .env nor .env.local found. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    exit
fi
echo "📝 Using environment from $ENV_FILE"

# 3. Setup Virtual Environment (Optional but recommended)
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# 4. Install Dependencies
echo "📦 Installing neural dependencies..."
pip install -r requirements.txt --quiet

# 5. Run Ingestion
echo "🧠 Starting Style Ingestion Pipeline..."
python3 scripts/ingest_latent_space.py

echo "✅ Pipeline Execution Complete."
