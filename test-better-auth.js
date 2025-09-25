#!/usr/bin/env node

/**
 * Test script to check Better Auth setup
 */

const fetch = require('node-fetch');

const FRONTEND_URL = 'http://localhost:3000';

async function testBetterAuth() {
  console.log('🧪 Testing Better Auth Setup...\n');

  try {
    // Test 1: Check if frontend is running
    console.log('1. Testing frontend availability...');
    try {
      const response = await fetch(`${FRONTEND_URL}/`);
      if (response.ok) {
        console.log('✅ Frontend is running on port 3000');
      } else {
        console.log('❌ Frontend not responding');
        return;
      }
    } catch (error) {
      console.log('❌ Frontend not running:', error.message);
      return;
    }

    // Test 2: Check Better Auth endpoints
    console.log('\n2. Testing Better Auth endpoints...');
    
    // Test signup endpoint
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
      
      console.log('Signup response status:', signupResponse.status);
      const signupData = await signupResponse.text();
      console.log('Signup response:', signupData);
      
      if (signupResponse.status === 404) {
        console.log('❌ Better Auth endpoints not found (404)');
        console.log('   This means the auth routes are not properly configured');
      } else if (signupResponse.status === 500) {
        console.log('⚠️  Better Auth endpoints found but server error (500)');
        console.log('   This means the routes exist but there\'s a configuration issue');
      } else {
        console.log('✅ Better Auth endpoints are working');
      }
    } catch (error) {
      console.log('❌ Error testing Better Auth:', error.message);
    }

    // Test 3: Check if auth routes exist
    console.log('\n3. Checking auth route structure...');
    try {
      const authResponse = await fetch(`${FRONTEND_URL}/api/auth/`);
      console.log('Auth base response status:', authResponse.status);
    } catch (error) {
      console.log('❌ Auth base route error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. Make sure frontend is running: cd frontend && npm run dev');
    console.log('2. Check if Better Auth is properly configured');
    console.log('3. Verify environment variables are set');
    console.log('4. Check if database is connected');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBetterAuth().catch(console.error);
}

module.exports = { testBetterAuth };
