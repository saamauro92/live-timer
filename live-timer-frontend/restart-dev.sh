#!/bin/bash

# Kill any existing Nuxt processes
echo "🔄 Stopping existing Nuxt processes..."
pkill -f "nuxt dev" || true
pkill -f "node.*nuxt" || true

# Wait a moment for processes to fully stop
sleep 2

# Clear Nuxt cache
echo "🧹 Clearing Nuxt cache..."
rm -rf .nuxt
rm -rf .output
rm -rf node_modules/.cache

# Restart the development server
echo "🚀 Starting Nuxt development server..."
npm run dev
