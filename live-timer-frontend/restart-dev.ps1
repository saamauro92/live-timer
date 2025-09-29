# PowerShell script to restart Nuxt development server

Write-Host "🔄 Stopping existing Nuxt processes..." -ForegroundColor Yellow

# Kill any existing Nuxt processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*nuxt*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to fully stop
Start-Sleep -Seconds 2

# Clear Nuxt cache
Write-Host "🧹 Clearing Nuxt cache..." -ForegroundColor Blue
if (Test-Path ".nuxt") { Remove-Item -Recurse -Force ".nuxt" }
if (Test-Path ".output") { Remove-Item -Recurse -Force ".output" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }

# Restart the development server
Write-Host "🚀 Starting Nuxt development server..." -ForegroundColor Green
npm run dev
