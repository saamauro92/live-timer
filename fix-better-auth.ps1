# Fix Better Auth Configuration
Write-Host "🔧 Fixing Better Auth Configuration..." -ForegroundColor Yellow

# Backup current .env
if (Test-Path "frontend/.env") {
    Copy-Item "frontend/.env" "frontend/.env.backup"
    Write-Host "✅ Backed up existing .env file" -ForegroundColor Green
}

# Create new .env file
$envContent = @"
# Database (same as backend)
NUXT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/live_timer

# Better Auth Secret (must match JWT_SECRET)
NUXT_BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-this-in-production

# Base URL
NUXT_APP_URL=http://localhost:3000
NUXT_APP_NAME=Live Timer
NUXT_APP_ENV=development

# API Base URL (backend)
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Redis (for Better Auth)
NUXT_REDIS_URL=redis://localhost:6379

# Email Configuration (for verification)
NUXT_RESEND_API_KEY=your-resend-api-key

# Social Login (optional)
NUXT_GH_CLIENT_ID=your-github-client-id
NUXT_GH_CLIENT_SECRET=your-github-client-secret
NUXT_GOOGLE_CLIENT_ID=your-google-client-id
NUXT_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Nitro preset
NUXT_NITRO_PRESET=node-server
"@

$envContent | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host "✅ Created new .env file with proper configuration" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Configuration Summary:" -ForegroundColor Cyan
Write-Host "  Database: postgresql://postgres:postgres@localhost:5432/live_timer" -ForegroundColor White
Write-Host "  Better Auth Secret: your-super-secret-jwt-key-change-this-in-production" -ForegroundColor White
Write-Host "  Frontend URL: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend URL: http://localhost:3001" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Test signup: http://localhost:3000/signup" -ForegroundColor White
Write-Host "3. Check if Better Auth endpoints work" -ForegroundColor White
Write-Host ""

Write-Host "🧪 To test Better Auth:" -ForegroundColor Cyan
Write-Host "  node test-better-auth.js" -ForegroundColor White
