#!/usr/bin/env node

/**
 * Authentication Integration Test Script
 * 
 * This script tests the complete authentication flow between
 * frontend (Nuxt.js + Better Auth) and backend (Node.js + Prisma)
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Test configuration
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;
let roomId = null;

console.log('🧪 Testing Authentication Integration...\n');

async function testBackendHealth() {
  console.log('1. Testing backend health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running');
    return true;
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('   Make sure to start the backend: npm run dev');
    return false;
  }
}

async function testFrontendHealth() {
  console.log('2. Testing frontend health...');
  try {
    const response = await axios.get(`${FRONTEND_URL}`);
    console.log('✅ Frontend is running');
    return true;
  } catch (error) {
    console.log('❌ Frontend is not running or not accessible');
    console.log('   Make sure to start the frontend: cd frontend && npm run dev');
    return false;
  }
}

async function testUserRegistration() {
  console.log('3. Testing user registration...');
  try {
    const response = await axios.post(`${FRONTEND_URL}/api/auth/sign-up`, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data) {
      console.log('✅ User registration successful');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ User already exists (expected)');
      return true;
    }
    console.log('❌ User registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('4. Testing user login...');
  try {
    const response = await axios.post(`${FRONTEND_URL}/api/auth/sign-in`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data?.session?.token) {
      authToken = response.data.session.token;
      console.log('✅ User login successful');
      return true;
    }
  } catch (error) {
    console.log('❌ User login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testBackendAuthentication() {
  console.log('5. Testing backend authentication...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/rooms`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Backend authentication successful');
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Backend authentication failed - JWT token not valid');
      console.log('   Check that JWT_SECRET matches between frontend and backend');
      return false;
    }
    console.log('❌ Backend authentication failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testRoomCreation() {
  console.log('6. Testing room creation...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/rooms`, {
      name: 'Test Room',
      description: 'A test room for authentication testing'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.success && response.data?.data?.id) {
      roomId = response.data.data.id;
      console.log('✅ Room creation successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Room creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testSocketAuthentication() {
  console.log('7. Testing Socket.IO authentication...');
  try {
    const { io } = require('socket.io-client');
    
    const socket = io(BACKEND_URL, {
      auth: {
        token: authToken
      }
    });
    
    return new Promise((resolve) => {
      socket.on('connect', () => {
        console.log('✅ Socket.IO connection successful');
        socket.disconnect();
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ Socket.IO authentication failed:', error.message);
        resolve(false);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('❌ Socket.IO connection timeout');
        socket.disconnect();
        resolve(false);
      }, 5000);
    });
  } catch (error) {
    console.log('❌ Socket.IO test failed:', error.message);
    return false;
  }
}

async function testDatabaseSync() {
  console.log('8. Testing database synchronization...');
  try {
    // Test if user exists in database
    const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data?.success) {
      console.log('✅ Database synchronization successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Database synchronization failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  const tests = [
    testBackendHealth,
    testFrontendHealth,
    testUserRegistration,
    testUserLogin,
    testBackendAuthentication,
    testRoomCreation,
    testSocketAuthentication,
    testDatabaseSync
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
    }
    console.log(''); // Add spacing between tests
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('- Test the complete user flow in the browser');
  console.log('- Verify room creation and timer functionality');
  console.log('- Test real-time updates via Socket.IO');
  console.log('- Configure production environment variables');
}

// Run the tests
runTests().catch(console.error);
