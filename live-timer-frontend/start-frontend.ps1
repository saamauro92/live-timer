# Live Timer Frontend Startup Script
Write-Host "Starting Live Timer Frontend..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Set environment variables
$env:NUXT_PUBLIC_API_BASE = "http://localhost:3000"
$env:NUXT_PUBLIC_SOCKET_URL = "http://localhost:3000"
$env:NUXT_PUBLIC_APP_NAME = "Live Timer"
$env:NUXT_PUBLIC_APP_URL = "http://localhost:3001"

Write-Host "Starting development server on http://localhost:3001" -ForegroundColor Cyan
Write-Host "Make sure your backend is running on http://localhost:3000" -ForegroundColor Yellow

# Start the development server
npm run dev
