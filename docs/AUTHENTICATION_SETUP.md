# Authentication Synchronization Setup Guide

## Overview

This guide explains how to set up unified authentication between the frontend (Nuxt.js with Better Auth) and backend (Node.js with Prisma) for the live timer application.

## Architecture

### Frontend (Nuxt.js)
- **Authentication**: Better Auth with Drizzle ORM
- **Database**: PostgreSQL with Drizzle schema
- **Features**: Email/password, social login (GitHub, Google), email verification

### Backend (Node.js)
- **Authentication**: JWT tokens compatible with Better Auth
- **Database**: PostgreSQL with Prisma ORM
- **Features**: Room management, timer control, real-time updates via Socket.IO

## Database Schema

Both frontend and backend now use the same user authentication tables:

```sql
-- User table (matches Better Auth schema)
CREATE TABLE "user" (
  "id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN DEFAULT false,
  "image" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "role" TEXT,
  "banned" BOOLEAN DEFAULT false,
  "ban_reason" TEXT,
  "ban_expires" TIMESTAMPTZ,
  "stripe_customer_id" TEXT,
  "polar_customer_id" TEXT
);

-- Account table (for OAuth providers)
CREATE TABLE "account" (
  "id" UUID PRIMARY KEY,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" TIMESTAMPTZ,
  "refresh_token_expires_at" TIMESTAMPTZ,
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Verification table (for email verification)
CREATE TABLE "verification" (
  "id" UUID PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription table (for billing)
CREATE TABLE "subscription" (
  "id" UUID PRIMARY KEY,
  "plan" TEXT NOT NULL,
  "reference_id" TEXT NOT NULL,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "status" TEXT DEFAULT 'incomplete',
  "period_start" TIMESTAMPTZ,
  "period_end" TIMESTAMPTZ,
  "trial_start" TIMESTAMPTZ,
  "trial_end" TIMESTAMPTZ,
  "cancel_at_period_end" BOOLEAN DEFAULT false,
  "seats" INTEGER
);

-- Room table (timer application)
CREATE TABLE "rooms" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "share_token" UUID UNIQUE DEFAULT gen_random_uuid(),
  "owner_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Timer table (timer application)
CREATE TABLE "timers" (
  "id" UUID PRIMARY KEY,
  "room_id" UUID NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "start_timestamp" TIMESTAMPTZ NOT NULL,
  "end_timestamp" TIMESTAMPTZ NOT NULL,
  "duration" INTEGER NOT NULL,
  "is_active" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup Instructions

### 1. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio to verify tables
npm run db:studio
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/live_timer_db"

# JWT Secret (must match frontend)
JWT_SECRET="your-super-secret-jwt-key-here"

# Redis (for Socket.IO scaling)
REDIS_URL="redis://localhost:6379"

# CORS (frontend URL)
CORS_ORIGIN="http://localhost:3000"

# Backend Port
PORT=3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Frontend Environment

Update `frontend/.env`:

```env
# Database (same as backend)
DATABASE_URL="postgresql://username:password@localhost:5432/live_timer_db"

# Better Auth Secret (must match JWT_SECRET)
BETTER_AUTH_SECRET="your-super-secret-jwt-key-here"

# Frontend URL
NUXT_PUBLIC_BASE_URL="http://localhost:3000"

# Backend API URL
NUXT_PUBLIC_API_BASE="http://localhost:3001"
NUXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 4. Start Services

**Option 1: Quick Setup (Recommended)**
```bash
# Run the setup script
./start-dev.sh        # Linux/Mac
# OR
.\start-dev.ps1       # Windows PowerShell
```

**Option 2: Manual Setup**
```bash
# Terminal 1: Start backend (port 3001)
npm run dev

# Terminal 2: Start frontend (port 3000)
cd frontend
npm run dev

# Terminal 3: Start Redis (if not running)
redis-server
```

**Port Configuration:**
- Frontend (Nuxt.js): http://localhost:3000
- Backend (Node.js): http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

## Authentication Flow

### 1. User Registration/Login (Frontend)

```typescript
// Frontend: User signs up/logs in via Better Auth
const { data, error } = await $fetch('/api/auth/sign-up', {
  method: 'POST',
  body: {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  }
});

// Better Auth automatically creates user in database
// JWT token is generated and stored in cookies
```

### 2. API Requests (Frontend to Backend)

```typescript
// Frontend: Make authenticated requests to backend
const token = await $auth.getSession(); // Get JWT token from Better Auth

const response = await $fetch('http://localhost:3000/api/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token.accessToken}`,
    'Content-Type': 'application/json'
  },
  body: {
    name: 'My Timer Room',
    description: 'Room for my event'
  }
});
```

### 3. Backend Authentication (Middleware)

```typescript
// Backend: authenticateToken middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and is not banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, banned: true }
    });
    
    if (!user || user.banned) {
      return res.status(401).json({ message: 'User not found or banned' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
```

## API Endpoints

### Room Management

```typescript
// Create room (requires authentication)
POST /api/rooms
Authorization: Bearer <jwt-token>
Body: { name: string, description?: string }

// Get room by share token (public)
GET /api/rooms/:shareToken

// Update room (requires room ownership)
PUT /api/rooms/:id
Authorization: Bearer <jwt-token>
Body: { name?: string, description?: string }

// Delete room (requires room ownership)
DELETE /api/rooms/:id
Authorization: Bearer <jwt-token>
```

### Timer Management

```typescript
// Create timer (requires room ownership)
POST /api/rooms/:roomId/timers
Authorization: Bearer <jwt-token>
Body: { title: string, description?: string, duration: number }

// Get timers (public with share token, private with auth)
GET /api/rooms/:roomId/timers?shareToken=<token>
GET /api/rooms/:roomId/timers
Authorization: Bearer <jwt-token>

// Control timers (requires authentication)
POST /api/timers/:id/start
POST /api/timers/:id/pause
POST /api/timers/:id/reset
Authorization: Bearer <jwt-token>
```

## Socket.IO Integration

### Frontend Socket Connection

```typescript
// Frontend: Connect to Socket.IO with authentication
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: userToken // JWT token from Better Auth
  }
});

// Join room for real-time updates
socket.emit('join-room', {
  shareToken: 'room-share-token',
  userId: user.id
});

// Listen for timer updates
socket.on('timer-update', (timer) => {
  // Update UI with new timer state
});
```

### Backend Socket Authentication

```typescript
// Backend: Socket.IO with JWT authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (user && !user.banned) {
      socket.userId = user.id;
      socket.user = user;
      next();
    } else {
      next(new Error('Authentication failed'));
    }
  } catch (error) {
    next(new Error('Invalid token'));
  }
});
```

## Testing

### 1. Run Authentication Tests

```bash
# Test authentication synchronization
node test-auth-sync.js
```

### 2. Manual Testing

1. **Start both services**:
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

2. **Test user registration**:
   - Go to `http://localhost:3000/signup`
   - Create a new account
   - Verify email (if required)

3. **Test room creation**:
   - Login to frontend
   - Create a new room
   - Verify room appears in backend database

4. **Test timer functionality**:
   - Create timers in the room
   - Start/pause/reset timers
   - Verify real-time updates work

## Troubleshooting

### Common Issues

1. **JWT Secret Mismatch**:
   - Ensure `JWT_SECRET` in backend matches `BETTER_AUTH_SECRET` in frontend
   - Restart both services after changing secrets

2. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Run `npm run db:migrate` to ensure tables exist

3. **CORS Issues**:
   - Check `CORS_ORIGIN` in backend matches frontend URL
   - Ensure frontend is making requests to correct backend URL

4. **Socket.IO Connection**:
   - Verify Redis is running for Socket.IO scaling
   - Check network connectivity between frontend and backend

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
DEBUG=* npm run dev
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret for production
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Configure appropriate rate limits
4. **Input Validation**: All inputs are validated with Zod schemas
5. **SQL Injection**: Prisma prevents SQL injection attacks
6. **CORS**: Configure CORS properly for production domains

## Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use managed PostgreSQL service (AWS RDS, etc.)
3. **Redis**: Use managed Redis service (AWS ElastiCache, etc.)
4. **SSL**: Configure SSL certificates
5. **Monitoring**: Set up logging and monitoring
6. **Backup**: Configure database backups

## Next Steps

1. ✅ Database schema synchronized
2. ✅ Authentication middleware updated
3. ✅ API endpoints secured
4. ✅ Socket.IO authentication implemented
5. 🔄 Test authentication flow
6. 🔄 Deploy to production
7. 🔄 Set up monitoring and logging

The authentication system is now fully synchronized between frontend and backend, providing a seamless user experience with proper security measures in place.
