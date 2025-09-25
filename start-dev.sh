#!/bin/bash

# Live Timer Server - Development Startup Script
echo "🚀 Starting Live Timer Server Development Environment"
echo "=================================================="

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
fi

# Check if frontend .env exists
if [ ! -f frontend/.env ]; then
    echo "📋 Creating frontend .env file..."
    cat > frontend/.env << EOF
# Database (same as backend)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/live_timer"

# Better Auth Secret (must match JWT_SECRET)
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Base URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"

# API Base URL (backend)
NUXT_PUBLIC_API_BASE="http://localhost:3001"
NUXT_PUBLIC_SOCKET_URL="http://localhost:3001"
EOF
    echo "✅ Frontend .env file created"
fi

echo ""
echo "🔧 Port Configuration:"
echo "  Frontend (Nuxt.js): http://localhost:3000"
echo "  Backend (Node.js):  http://localhost:3001"
echo "  Database:           localhost:5432"
echo "  Redis:              localhost:6379"
echo ""

echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..

echo ""
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "  Terminal 1: npm run dev          (Backend on port 3001)"
echo "  Terminal 2: cd frontend && npm run dev  (Frontend on port 3000)"
echo ""
echo "🧪 To test authentication:"
echo "  node test-auth-sync.js"
echo ""
echo "📖 For detailed setup instructions, see AUTHENTICATION_SETUP.md"
