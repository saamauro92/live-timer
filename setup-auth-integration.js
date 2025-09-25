#!/usr/bin/env node

/**
 * Authentication Integration Setup Script
 * 
 * This script helps set up the authentication integration between
 * the frontend (Nuxt.js + Better Auth) and backend (Node.js + Prisma)
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up Authentication Integration...\n');

// Check if .env files exist
const backendEnvPath = '.env';
const frontendEnvPath = 'frontend/.env';

console.log('📋 Checking environment configuration...');

// Backend environment setup
if (!fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Backend .env file not found. Creating from example...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', backendEnvPath);
    console.log('✅ Backend .env file created');
  } else {
    console.log('❌ env.example not found. Please create .env manually.');
  }
} else {
  console.log('✅ Backend .env file exists');
}

// Frontend environment setup
if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Frontend .env file not found. Creating from example...');
  const frontendEnvContent = `# Frontend Environment Configuration
NODE_ENV=development

# Database Configuration (same as backend)
DATABASE_URL=postgresql://postgres:Belgrano949@localhost:5432/live_timer

# Better Auth Configuration (MUST match backend JWT_SECRET)
NUXT_BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NUXT_APP_URL=http://localhost:3000
NUXT_APP_NAME=Live Timer
NUXT_APP_NOTIFY_EMAIL=noreply@yourdomain.com
NUXT_APP_CONTACT_EMAIL=support@yourdomain.com

# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Payment Configuration
NUXT_PAYMENT=stripe

# Email Configuration
NUXT_RESEND_API_KEY=your_resend_api_key

# Social Login Configuration
NUXT_GH_CLIENT_ID=your_github_client_id
NUXT_GH_CLIENT_SECRET=your_github_client_secret
NUXT_GOOGLE_CLIENT_ID=your_google_client_id
NUXT_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Storage Configuration
NUXT_APP_STORAGE=local
NUXT_LOCAL_UPLOAD_DIR=./uploads
NUXT_LOCAL_PUBLIC_PATH=/uploads
`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env file created');
} else {
  console.log('✅ Frontend .env file exists');
}

console.log('\n🔧 Database setup instructions:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Create database: createdb live_timer');
console.log('3. Run migrations: npm run db:migrate');
console.log('4. Generate Prisma client: npm run db:generate');

console.log('\n🚀 Starting services:');
console.log('1. Backend: npm run dev (port 3001)');
console.log('2. Frontend: cd frontend && npm run dev (port 3000)');
console.log('3. Redis: redis-server (port 6379)');

console.log('\n🔐 Authentication flow:');
console.log('1. User signs up/logs in via frontend Better Auth');
console.log('2. JWT token is stored in cookies');
console.log('3. Frontend uses token for API calls to backend');
console.log('4. Backend validates JWT token and extracts user info');
console.log('5. Socket.IO connections use JWT for authentication');

console.log('\n✅ Authentication integration setup complete!');
console.log('\n📝 Next steps:');
console.log('- Update environment variables with your actual values');
console.log('- Configure social login providers (GitHub, Google)');
console.log('- Set up email service (Resend)');
console.log('- Test the authentication flow');
