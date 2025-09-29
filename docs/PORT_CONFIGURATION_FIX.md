# Port Configuration Fix

## ✅ **Issues Fixed**

### 1. **Port Conflict Resolution**
- **Before**: Both frontend and backend were trying to use port 3000 ❌
- **After**: 
  - Frontend (Nuxt.js): Port 3000 ✅
  - Backend (Node.js): Port 3001 ✅

### 2. **$fetch vs fetch Clarification**
- **$fetch is CORRECT** in Nuxt.js ✅
- `$fetch` is Nuxt's enhanced fetch utility with better error handling, SSR support, and automatic base URL resolution
- Regular `fetch` is the native browser API
- **Recommendation**: Use `$fetch` for all API calls in Nuxt.js

## 🔧 **Changes Made**

### Backend Configuration
1. **Updated `env.example`**:
   ```env
   PORT=3001                    # Changed from 3000
   CORS_ORIGIN=http://localhost:3000  # Frontend URL
   ```

2. **Server Configuration**:
   - Backend now runs on port 3001
   - CORS configured for frontend on port 3000

### Frontend Configuration
1. **Updated `nuxt.config.ts`**:
   ```typescript
   runtimeConfig: {
     public: {
       apiBase: 'http://localhost:3001',      # Backend API
       socketUrl: 'http://localhost:3001'     # Backend Socket.IO
     }
   }
   ```

2. **Updated `useApi.ts` composable**:
   - Now uses `$fetch` instead of `fetch` ✅
   - Uses `config.public.apiBase` for proper URL resolution
   - Automatically adds backend base URL to all API calls

3. **Updated `useSocket.ts` composable**:
   - Uses `config.public.socketUrl` for Socket.IO connection
   - Defaults to `http://localhost:3001` if not configured

### Test Configuration
- **Updated `test-auth-sync.js`**:
  - Backend URL changed to `http://localhost:3001`

## 🚀 **How to Start Development**

### Option 1: Quick Setup (Recommended)
```bash
# Run the setup script
./start-dev.sh        # Linux/Mac
# OR
.\start-dev.ps1       # Windows PowerShell
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start backend (port 3001)
npm run dev

# Terminal 2: Start frontend (port 3000)
cd frontend
npm run dev
```

## 📍 **Port Configuration Summary**

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 3000 | http://localhost:3000 | Nuxt.js application |
| **Backend** | 3001 | http://localhost:3001 | Node.js API server |
| **Database** | 5432 | localhost:5432 | PostgreSQL |
| **Redis** | 6379 | localhost:6379 | Socket.IO scaling |

## 🔄 **API Flow**

### Frontend → Backend Communication
1. **Frontend** (port 3000) makes API calls to **Backend** (port 3001)
2. **$fetch** automatically uses `config.public.apiBase` (http://localhost:3001)
3. **Socket.IO** connects to `config.public.socketUrl` (http://localhost:3001)
4. **CORS** allows requests from http://localhost:3000 to http://localhost:3001

### Example API Call
```typescript
// Frontend code
const { createRoom } = useApi()

// This automatically calls: http://localhost:3001/api/rooms
const room = await createRoom({
  name: 'My Room',
  description: 'Test room'
})
```

## 🧪 **Testing**

### Test Authentication Flow
```bash
node test-auth-sync.js
```

### Manual Testing
1. **Start both services**:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2  
   cd frontend && npm run dev
   ```

2. **Test URLs**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/health
   - Backend Socket.IO: http://localhost:3001

3. **Test Authentication**:
   - Register/login in frontend
   - Create rooms and timers
   - Verify real-time updates work

## ✅ **Verification Checklist**

- [ ] Backend runs on port 3001
- [ ] Frontend runs on port 3000  
- [ ] API calls work from frontend to backend
- [ ] Socket.IO connection works
- [ ] Authentication flow works
- [ ] CORS is properly configured
- [ ] No port conflicts

## 🐛 **Troubleshooting**

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Kill the process if needed
   taskkill /PID <PID> /F
   ```

2. **CORS errors**:
   - Verify `CORS_ORIGIN=http://localhost:3000` in backend `.env`
   - Check that frontend is running on port 3000

3. **API connection errors**:
   - Verify `NUXT_PUBLIC_API_BASE=http://localhost:3001` in frontend `.env`
   - Check that backend is running on port 3001

4. **Socket.IO connection errors**:
   - Verify `NUXT_PUBLIC_SOCKET_URL=http://localhost:3001` in frontend `.env`
   - Check that backend Socket.IO is running

## 📝 **Environment Files**

### Backend `.env`
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/live_timer
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend `.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/live_timer"
BETTER_AUTH_SECRET="your-super-secret-jwt-key-change-this-in-production"
NUXT_PUBLIC_BASE_URL="http://localhost:3000"
NUXT_PUBLIC_API_BASE="http://localhost:3001"
NUXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

The port configuration is now properly set up for seamless development! 🎉
