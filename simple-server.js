const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('redis');

const app = express();
const PORT = 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json({
      success: true,
      data: rooms,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test Redis endpoint
app.get('/test-redis', async (req, res) => {
  try {
    await redisClient.set('test', 'Hello Redis!');
    const value = await redisClient.get('test');
    res.json({
      success: true,
      data: { value },
      message: 'Redis connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Redis connection failed',
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    console.log('Starting server...');
    
    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Redis connected');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Test database: http://localhost:${PORT}/test-db`);
      console.log(`✅ Test Redis: http://localhost:${PORT}/test-redis`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
