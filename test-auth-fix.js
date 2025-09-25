#!/usr/bin/env node

/**
 * Test script to verify authentication fix
 * This script tests the Better Auth endpoints
 */

const fetch = require('node-fetch');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

async function testAuthenticationFix() {
  console.log('🧪 Testing Authentication Fix...\n');

  try {
    // Test 1: Frontend health check
    console.log('1. Testing frontend health...');
    try {
      const frontendResponse = await fetch(`${FRONTEND_URL}/`);
      if (frontendResponse.ok) {
        console.log('✅ Frontend is running on port 3000');
      } else {
        console.log('❌ Frontend not responding');
      }
    } catch (error) {
      console.log('❌ Frontend not running:', error.message);
    }

    // Test 2: Backend health check
    console.log('\n2. Testing backend health...');
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/health`);
      const backendData = await backendResponse.json();
      if (backendResponse.ok) {
        console.log('✅ Backend is running on port 3001:', backendData.message);
      } else {
        console.log('❌ Backend not responding');
      }
    } catch (error) {
      console.log('❌ Backend not running:', error.message);
    }

    // Test 3: Better Auth signup endpoint
    console.log('\n3. Testing Better Auth signup endpoint...');
    try {
      const signupResponse = await fetch(`${FRONTEND_URL}/api/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      const signupData = await signupResponse.json();
      if (signupResponse.ok) {
        console.log('✅ Better Auth signup endpoint working');
      } else {
        console.log('⚠️  Better Auth signup endpoint response:', signupData);
      }
    } catch (error) {
      console.log('❌ Better Auth signup endpoint error:', error.message);
    }

    // Test 4: Better Auth signin endpoint
    console.log('\n4. Testing Better Auth signin endpoint...');
    try {
      const signinResponse = await fetch(`${FRONTEND_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      const signinData = await signinResponse.json();
      if (signinResponse.ok) {
        console.log('✅ Better Auth signin endpoint working');
      } else {
        console.log('⚠️  Better Auth signin endpoint response:', signinData);
      }
    } catch (error) {
      console.log('❌ Better Auth signin endpoint error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Authentication fix test completed!');
    console.log('\nNext steps:');
    console.log('1. Make sure both services are running:');
    console.log('   - Frontend: npm run dev (port 3000)');
    console.log('   - Backend: npm run dev (port 3001)');
    console.log('2. Test signup/signin in the browser:');
    console.log('   - Go to http://localhost:3000/signup');
    console.log('   - Try creating an account');
    console.log('3. Check browser console for any errors');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthenticationFix().catch(console.error);
}

module.exports = { testAuthenticationFix };
