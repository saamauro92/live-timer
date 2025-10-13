# Live Timer Server

A production-ready Node.js countdown timer server with real-time synchronization using Socket.IO and HTTP hybrid architecture.

## Features

- 🚀 **Hybrid Architecture**: HTTP for reliable commands, Socket.IO for real-time updates
- 🔒 **Security**: JWT authentication, rate limiting, input validation, CORS protection
- 📊 **Scalability**: Redis adapter for horizontal scaling, cluster support
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- ⚡ **Performance**: Connection pooling, compression, caching
- 🐳 **Docker**: Production-ready containerization
- 📝 **Logging**: Winston with structured logging
- 🔄 **Real-time**: Live timer synchronization across multiple clients

## Architecture

### Hybrid HTTP + Socket.IO Approach

- **HTTP POST**: Reliable timer control (start/pause/reset)
- **Socket.IO**: Real-time updates and room management
- **Fallback**: Periodic sync when socket connection is lost
- **Resilient**: Admin can control timers even with socket issues

### Key Benefits

- ✅ **Reliability**: HTTP requests have built-in retry mechanisms
- ✅ **Performance**: Real-time updates when socket is available
- ✅ **User Experience**: Commands always work, instant feedback
- ✅ **Production Ready**: Proper error handling and monitoring

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Quick Start (Docker - Easiest)

```bash
# 1. Clone and install
git clone <repository-url>
cd live-timer-server
npm install

# 2. Setup environment
cp env.example .env

# 3. Start PostgreSQL and Redis
docker-compose up -d postgres redis

# 4. Setup database
npm run db:generate
npm run db:push

# 5. Start the server
npm run dev
```

### Full Installation Guide

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd live-timer-server
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL**

   **Option A: Using Docker** (Recommended)

   ```bash
   # Start only PostgreSQL
   docker-compose up -d postgres

   # Verify PostgreSQL is running
   docker-compose ps postgres

   # Test connection
   docker exec -it live-timer-postgres psql -U postgres -d live_timer
   ```

   **Option B: Local Installation** (macOS)

   ```bash
   # Install PostgreSQL via Homebrew
   brew install postgresql@15

   # Start PostgreSQL as a service (runs in background)
   brew services start postgresql@15

   # Or start PostgreSQL manually
   postgres -D /usr/local/var/postgres

   # Create database
   createdb live_timer

   # Verify PostgreSQL is running
   psql -U postgres -d live_timer
   ```

   **Option C: Local Installation** (Linux)

   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-15

   # Start PostgreSQL
   sudo systemctl start postgresql

   # Enable PostgreSQL to start on boot
   sudo systemctl enable postgresql

   # Create database
   sudo -u postgres createdb live_timer

   # Verify PostgreSQL is running
   sudo systemctl status postgresql
   ```

   **Option D: Local Installation** (Windows)

   ```bash
   # Download from: https://www.postgresql.org/download/windows/

   # Or use Docker Desktop for Windows
   docker run -d -p 5432:5432 \
     -e POSTGRES_DB=live_timer \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=your_password \
     postgres:15-alpine
   ```

4. **Start Redis**

   **Option A: Using Docker** (Recommended)

   ```bash
   # Start only Redis
   docker-compose up -d redis

   # Or start all services (PostgreSQL + Redis)
   docker-compose up -d postgres redis

   # Verify Redis is running
   docker-compose ps redis
   ```

   **Option B: Local Installation** (macOS)

   ```bash
   # Install Redis via Homebrew
   brew install redis

   # Start Redis as a service (runs in background)
   brew services start redis

   # Or start Redis manually (runs in foreground)
   redis-server

   # Verify Redis is running
   redis-cli ping
   # Should respond with: PONG
   ```

   **Option C: Local Installation** (Linux)

   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server

   # Verify Redis is running
   redis-cli ping
   ```

   **Option D: Local Installation** (Windows)

   ```bash
   # Using WSL2 or download from:
   # https://github.com/microsoftarchive/redis/releases

   # Or use Docker Desktop for Windows
   docker run -d -p 6379:6379 redis:7-alpine
   ```

5. **Set up database schema**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:push
   ```

6. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Troubleshooting Docker

**"Cannot connect to the Docker daemon" error:**

This means Docker Desktop is not running.

```bash
# macOS
# 1. Open Docker Desktop application from Applications folder
# 2. Wait for Docker to fully start (whale icon in menu bar)
# 3. Verify Docker is running:
docker ps

# If Docker Desktop is not installed:
# Download from: https://www.docker.com/products/docker-desktop

# Linux
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is running
docker info
```

**"version is obsolete" warning:**

This is just a warning and can be safely ignored. To remove it:

```bash
# Edit docker-compose.yml and remove the first line:
# version: '3.8'
```

**Docker containers not starting:**

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs postgres
docker-compose logs redis

# Restart containers
docker-compose restart postgres redis

# Rebuild and restart
docker-compose up -d --build
```

### Troubleshooting PostgreSQL

**Check if PostgreSQL is running:**

```bash
# For local installation (macOS)
brew services list | grep postgresql
# or
pg_isready

# For local installation (Linux)
sudo systemctl status postgresql

# For Docker
docker-compose ps postgres
# or
docker exec -it live-timer-postgres pg_isready -U postgres
```

**PostgreSQL not connecting:**

- Verify the `DATABASE_URL` in your `.env` file matches your PostgreSQL setup
- Local PostgreSQL: `postgresql://postgres:your_password@localhost:5432/live_timer`
- Docker PostgreSQL: `postgresql://postgres:Belgrano949@localhost:5432/live_timer` (using docker-compose.yml credentials)
- Check if PostgreSQL port is already in use: `lsof -i :5432`
- Verify database exists: `psql -U postgres -l`

**Common PostgreSQL issues:**

```bash
# Reset database (WARNING: deletes all data)
npm run db:push -- --force-reset

# Check Prisma connection
npx prisma db pull

# View database in browser
npm run db:studio
```

**Stop PostgreSQL:**

```bash
# Docker
docker-compose stop postgres

# macOS (if running as service)
brew services stop postgresql@15

# Linux
sudo systemctl stop postgresql
```

### Troubleshooting Redis

**Check if Redis is running:**

```bash
# For local installation
redis-cli ping

# For Docker
docker-compose ps redis
# or
docker exec -it live-timer-redis redis-cli ping
```

**Redis not connecting:**

- Verify the `REDIS_URL` in your `.env` file matches your Redis setup
- Local Redis: `redis://localhost:6379`
- Docker Redis: `redis://localhost:6380` (if using the provided docker-compose.yml)
- Check if Redis port is already in use: `lsof -i :6379`

**Stop Redis:**

```bash
# Docker
docker-compose stop redis

# macOS (if running as service)
brew services stop redis

# Linux
sudo systemctl stop redis-server
```

## API Endpoints

### Room Management

- `POST /api/rooms` - Create new room
- `GET /api/rooms/:shareToken` - Get room by share token
- `PUT /api/rooms/:id` - Update room (owner only)
- `DELETE /api/rooms/:id` - Delete room (owner only)

### Timer Management

- `POST /api/rooms/:roomId/timers` - Create timer
- `PUT /api/timers/:id` - Update timer
- `DELETE /api/timers/:id` - Delete timer
- `POST /api/timers/:id/start` - Start timer
- `POST /api/timers/:id/pause` - Pause timer
- `POST /api/timers/:id/reset` - Reset timer

### Socket.IO Events

#### Client → Server

- `join-room`: Join room by share token
- `ping`: Heartbeat for connection health
- `request-sync`: Manual sync when needed

#### Server → Client

- `room-state`: Complete room state with all timers
- `timer-update`: Individual timer state change
- `timer-created`: New timer added
- `timer-deleted`: Timer removed
- `timer-finished`: Timer completed notification
- `user-count`: Number of users in room
- `error`: Error messages

## Frontend Integration

### Vue.js Example

```javascript
// Admin timer control
async function startTimer(timerId) {
  try {
    const response = await fetch(`/api/timers/${timerId}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to start timer");
    }

    // Success! Server will broadcast via Socket.IO
  } catch (error) {
    console.error("Timer control failed:", error);
    // Handle error with retry logic
  }
}

// Socket.IO for real-time updates
const socket = io("http://localhost:3000");

socket.on("timer-update", (updatedTimer) => {
  // Update UI immediately when ANY timer changes
  updateTimerInUI(updatedTimer);
});

socket.on("room-state", (roomData) => {
  // Sync complete room state
  syncRoomState(roomData);
});
```

## Environment Variables

| Variable                  | Description                  | Default                  |
| ------------------------- | ---------------------------- | ------------------------ |
| `NODE_ENV`                | Environment                  | `development`            |
| `PORT`                    | Server port                  | `3000`                   |
| `DATABASE_URL`            | PostgreSQL connection string | Required                 |
| `REDIS_URL`               | Redis connection string      | `redis://localhost:6379` |
| `JWT_SECRET`              | JWT signing secret           | Required                 |
| `CORS_ORIGIN`             | Allowed CORS origin          | `http://localhost:5173`  |
| `LOG_LEVEL`               | Logging level                | `info`                   |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window            | `60000`                  |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window      | `100`                    |

## Production Deployment

### Docker Compose

The included `docker-compose.yml` provides:

- PostgreSQL database
- Redis cache
- Live Timer Server
- Nginx reverse proxy
- Health checks
- Volume persistence

### Nginx Configuration

The `nginx.conf` includes:

- Rate limiting
- Gzip compression
- Security headers
- WebSocket support
- SSL/TLS configuration (uncomment for HTTPS)

### Monitoring

- Health check endpoint: `GET /health`
- Socket.IO stats: `GET /api/stats/socket`
- Structured logging with Winston
- Graceful shutdown handling

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
src/
├── server.ts              # Main server entry
├── app.ts                 # Express app configuration
├── config/
│   ├── database.ts        # Prisma client setup
│   └── redis.ts           # Redis client setup
├── controllers/
│   ├── room.controller.ts
│   └── timer.controller.ts
├── services/
│   ├── room.service.ts
│   ├── timer.service.ts
│   └── socket.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── error.middleware.ts
├── models/
│   └── schemas.ts         # Zod validation schemas
├── utils/
│   ├── logger.ts
│   └── helpers.ts
└── types/
    └── index.ts           # TypeScript interfaces
```

## Security Features

- JWT authentication for admin controls
- Rate limiting per IP and per endpoint
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- CORS configuration
- Helmet security headers
- XSS protection
- CSRF protection

## Performance Features

- Connection pooling for database
- Redis caching and pub/sub
- Compression middleware
- Clustered workers
- Memory-efficient timer state management
- Horizontal scaling support

## License

MIT License - see LICENSE file for details.
