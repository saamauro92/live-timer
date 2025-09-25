#!/usr/bin/env node

/**
 * Test CORS configuration for the server
 */

const fetch = require('node-fetch');

async function testCORS() {
  console.log('🧪 Testing CORS configuration...');
  
  try {
    // Test the health endpoint
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Health endpoint response:', response.status);
    console.log('📋 CORS headers:');
    console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    console.log('  Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('  Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    console.log('  Access-Control-Allow-Credentials:', response.headers.get('access-control-allow-credentials'));
    
    const data = await response.json();
    console.log('📄 Response data:', data);
    
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

testCORS();
