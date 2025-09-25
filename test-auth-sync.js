#!/usr/bin/env node

/**
 * Test script to verify authentication synchronization between frontend and backend
 * This script tests the unified authentication system
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test user data (matches frontend Better Auth schema)
const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  emailVerified: true
};

// Generate JWT token (simulating frontend Better Auth)
function generateTestToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function testAuthentication() {
  console.log('🧪 Testing Authentication Synchronization...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test 2: Create room without authentication (should fail)
    console.log('\n2. Testing room creation without authentication...');
    try {
      const roomResponse = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Room',
          description: 'Test room description'
        })
      });
      const roomData = await roomResponse.json();
      if (roomResponse.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request:', roomData.message);
      } else {
        console.log('❌ Should have rejected unauthenticated request');
      }
    } catch (error) {
      console.log('❌ Error testing unauthenticated request:', error.message);
    }

    // Test 3: Create room with authentication (should succeed)
    console.log('\n3. Testing room creation with authentication...');
    const token = generateTestToken(testUser);
    try {
      const roomResponse = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Room',
          description: 'Test room description'
        })
      });
      const roomData = await roomResponse.json();
      if (roomResponse.ok) {
        console.log('✅ Room created successfully:', roomData.data.id);
        console.log('   Share token:', roomData.data.shareToken);
        return roomData.data;
      } else {
        console.log('❌ Failed to create room:', roomData.message);
      }
    } catch (error) {
      console.log('❌ Error creating room:', error.message);
    }

    // Test 4: Test room access via share token (should work without auth)
    console.log('\n4. Testing room access via share token...');
    try {
      const roomResponse = await fetch(`${BACKEND_URL}/api/rooms/${roomData.data.shareToken}`);
      const roomData = await roomResponse.json();
      if (roomResponse.ok) {
        console.log('✅ Room accessed via share token:', roomData.data.name);
      } else {
        console.log('❌ Failed to access room via share token:', roomData.message);
      }
    } catch (error) {
      console.log('❌ Error accessing room:', error.message);
    }

    // Test 5: Test timer creation with authentication
    console.log('\n5. Testing timer creation with authentication...');
    try {
      const timerResponse = await fetch(`${BACKEND_URL}/api/rooms/${roomData.data.id}/timers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Timer',
          description: 'Test timer description',
          duration: 60000 // 1 minute
        })
      });
      const timerData = await timerResponse.json();
      if (timerResponse.ok) {
        console.log('✅ Timer created successfully:', timerData.data.id);
        return { room: roomData.data, timer: timerData.data };
      } else {
        console.log('❌ Failed to create timer:', timerData.message);
      }
    } catch (error) {
      console.log('❌ Error creating timer:', error.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function testSocketConnection() {
  console.log('\n🔌 Testing Socket.IO Connection...');
  
  try {
    const { io } = require('socket.io-client');
    const socket = io(BACKEND_URL);
    
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
      
      // Test joining a room
      socket.emit('join-room', {
        shareToken: 'test-share-token',
        userId: testUser.id
      });
    });
    
    socket.on('room-state', (data) => {
      console.log('✅ Received room state:', data);
    });
    
    socket.on('error', (error) => {
      console.log('❌ Socket error:', error);
    });
    
    socket.on('disconnect', () => {
      console.log('✅ Socket disconnected');
    });
    
    // Close connection after 5 seconds
    setTimeout(() => {
      socket.disconnect();
    }, 5000);
    
  } catch (error) {
    console.log('❌ Socket.IO test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication Synchronization Tests\n');
  console.log('Backend URL:', BACKEND_URL);
  console.log('JWT Secret configured:', !!JWT_SECRET);
  console.log('Test User:', testUser.email);
  console.log('=' .repeat(50));
  
  const result = await testAuthentication();
  await testSocketConnection();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Authentication synchronization tests completed!');
  console.log('\nNext steps:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Start the frontend: cd frontend && npm run dev');
  console.log('3. Test the full authentication flow in the browser');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAuthentication, testSocketConnection, generateTestToken };
