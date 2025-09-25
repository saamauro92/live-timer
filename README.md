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

### Installation

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

3. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:push
   ```

4. **Start the server**
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
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to start timer');
    }
    
    // Success! Server will broadcast via Socket.IO
  } catch (error) {
    console.error('Timer control failed:', error);
    // Handle error with retry logic
  }
}

// Socket.IO for real-time updates
const socket = io('http://localhost:3000');

socket.on('timer-update', (updatedTimer) => {
  // Update UI immediately when ANY timer changes
  updateTimerInUI(updatedTimer);
});

socket.on('room-state', (roomData) => {
  // Sync complete room state
  syncRoomState(roomData);
});
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

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
