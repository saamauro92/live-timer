# Live Timer Frontend

A modern, performant Nuxt 3 frontend for the Live Timer SaaS application. This frontend integrates seamlessly with your existing Node.js backend.

## Features

- **Real-time Timers**: Socket.io integration for live timer synchronization
- **Room Management**: Create and join collaborative timer rooms
- **Authentication**: Secure user authentication with your existing backend
- **SaaS Features**: Stripe integration for subscription management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode**: Built-in dark/light mode support
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Nuxt 3**: Vue.js framework with SSR/SSG capabilities
- **Tailwind CSS**: Utility-first CSS framework
- **Pinia**: State management
- **Socket.io**: Real-time communication
- **Stripe**: Payment processing
- **TypeScript**: Type safety

## Quick Start

### Prerequisites

- Node.js 18+ 
- Your Live Timer backend running on port 3000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file with:
   ```env
   NUXT_PUBLIC_API_BASE=http://localhost:3000
   NUXT_PUBLIC_SOCKET_URL=http://localhost:3000
   NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   NUXT_PUBLIC_APP_NAME=Live Timer
   NUXT_PUBLIC_APP_URL=http://localhost:3001
   ```

3. **Start development server:**
   
   **Windows:**
   ```powershell
   .\start-frontend.ps1
   ```
   
   **Linux/Mac:**
   ```bash
   ./start-frontend.sh
   ```
   
   **Or manually:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3001`

## Project Structure

```
live-timer-frontend/
├── assets/css/           # Global styles
├── composables/          # Vue composables
│   ├── useApi.ts        # API client
│   ├── useAuth.ts       # Authentication
│   ├── useSocket.ts     # Socket.io integration
│   └── useStripe.ts     # Stripe integration
├── layouts/              # Page layouts
│   └── default.vue      # Main layout
├── middleware/           # Route middleware
│   └── auth.ts         # Authentication middleware
├── pages/               # Application pages
│   ├── index.vue        # Landing page
│   ├── login.vue        # Login page
│   ├── register.vue     # Registration page
│   ├── dashboard.vue    # User dashboard
│   ├── pricing.vue      # Pricing page
│   └── rooms/           # Room management
│       ├── index.vue    # Rooms list
│       └── [id].vue     # Individual room
└── nuxt.config.ts       # Nuxt configuration
```

## API Integration

The frontend connects to your existing backend through:

- **REST API**: For authentication, room management, and user data
- **Socket.io**: For real-time timer synchronization
- **Authentication**: Uses JWT tokens stored in HTTP-only cookies

### Backend Endpoints Used

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `GET /rooms` - List user rooms
- `POST /rooms` - Create new room
- `GET /rooms/:id` - Get room details
- `POST /rooms/:id/leave` - Leave room
- `GET /timers/:id` - Get room timer
- `GET /timers/active` - Get active timers

## Socket.io Events

### Client → Server
- `join-room` - Join a room
- `leave-room` - Leave a room
- `start-timer` - Start a timer
- `stop-timer` - Stop a timer
- `pause-timer` - Pause a timer
- `resume-timer` - Resume a timer

### Server → Client
- `timer-update` - Timer state update
- `member-joined` - New member joined
- `member-left` - Member left room

## SaaS Features

### Stripe Integration

The frontend includes Stripe integration for subscription management:

- **Checkout Sessions**: Create payment sessions
- **Customer Portal**: Manage subscriptions
- **Webhook Handling**: Process payment events

### Pricing Plans

- **Free**: Up to 3 rooms, 5 team members
- **Pro**: Unlimited rooms, 25 team members, analytics
- **Enterprise**: Unlimited everything, custom integrations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE` | Backend API URL | `http://localhost:3000` |
| `NUXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:3000` |
| `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Required for payments |
| `NUXT_PUBLIC_APP_NAME` | Application name | `Live Timer` |
| `NUXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3001` |

## Deployment

### Production Build

```bash
npm run build
```

### Environment Setup

For production, update your environment variables:

```env
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
NUXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
NUXT_PUBLIC_APP_NAME=Live Timer
NUXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

## Integration with Backend

This frontend is designed to work with your existing Live Timer backend. Make sure your backend:

1. **CORS is configured** to allow requests from `http://localhost:3001`
2. **Socket.io is enabled** for real-time features
3. **Authentication endpoints** are available
4. **Room and timer endpoints** are implemented

## Support

For issues or questions:

1. Check that your backend is running on port 3000
2. Verify all environment variables are set correctly
3. Check browser console for any errors
4. Ensure CORS is properly configured on your backend

## License

This project is part of the Live Timer SaaS application.