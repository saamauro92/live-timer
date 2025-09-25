#!/bin/bash

# Live Timer Frontend Startup Script
echo "Starting Live Timer Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set environment variables
export NUXT_PUBLIC_API_BASE="http://localhost:3000"
export NUXT_PUBLIC_SOCKET_URL="http://localhost:3000"
export NUXT_PUBLIC_APP_NAME="Live Timer"
export NUXT_PUBLIC_APP_URL="http://localhost:3001"

echo "Starting development server on http://localhost:3001"
echo "Make sure your backend is running on http://localhost:3000"

# Start the development server
npm run dev
