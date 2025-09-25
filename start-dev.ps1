# Live Timer Server - Development Startup Script (PowerShell)
Write-Host "🚀 Starting Live Timer Server Development Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if .env exists, if not copy from example
if (!(Test-Path .env)) {
    Write-Host "📋 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Check if frontend .env exists
if (!(Test-Path frontend/.env)) {
    Write-Host "📋 Creating frontend .env file..." -ForegroundColor Yellow
    $frontendEnv = @"
# Database (same as backend)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/live_timer"

# Better Auth Secret (must match JWT_SECRET)
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Base URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"

# API Base URL (backend)
NUXT_PUBLIC_API_BASE="http://localhost:3001"
NUXT_PUBLIC_SOCKET_URL="http://localhost:3001"
"@
    $frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8
    Write-Host "✅ Frontend .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Port Configuration:" -ForegroundColor Cyan
Write-Host "  Frontend (Nuxt.js): http://localhost:3000" -ForegroundColor White
Write-Host "  Backend (Node.js):  http://localhost:3001" -ForegroundColor White
Write-Host "  Database:           localhost:5432" -ForegroundColor White
Write-Host "  Redis:              localhost:6379" -ForegroundColor White
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
npm run db:generate
npm run db:migrate

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start development:" -ForegroundColor Cyan
Write-Host "  Terminal 1: npm run dev          (Backend on port 3001)" -ForegroundColor White
Write-Host "  Terminal 2: cd frontend && npm run dev  (Frontend on port 3000)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To test authentication:" -ForegroundColor Cyan
Write-Host "  node test-auth-sync.js" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed setup instructions, see AUTHENTICATION_SETUP.md" -ForegroundColor Cyan
