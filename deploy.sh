#!/bin/bash
# Exit on error
set -e

# Error handling function
handle_error() {
    echo "❌ Error occurred in deployment at line $1"
    exit 1
}
trap 'handle_error $LINENO' ERR

# Ensure script runs in its own directory
cd "$(dirname "$0")"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in the system PATH."
    exit 1
fi

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    else
        echo "Warning: No .env or .env.example found!"
    fi
fi

echo "🚀 Starting Uprising Cofounder Deployment..."

echo "🏗️ Building Docker containers..."
docker compose build

echo "🟢 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "✅ App successfully deployed!"
echo "👉 Frontend is running on port 80 (http://localhost:80)"
echo "👉 Backend API is running on port 3000"
echo "👉 Ollama is running on port 11434"
