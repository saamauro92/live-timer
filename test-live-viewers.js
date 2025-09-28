#!/usr/bin/env node

/**
 * Test script for live viewers functionality
 * This script tests the socket connection and user count updates
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function testLiveViewers() {
  console.log('🧪 Testing Live Viewers Functionality');
  console.log('=====================================');
  
  // Test 1: Check if socket service is available
  console.log('\n1. Testing socket service availability...');
  try {
    const response = await fetch(`${API_BASE}/api/debug/connections`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Socket service is available');
      console.log('📊 Current connections:', JSON.stringify(data.data, null, 2));
    } else {
      console.log('❌ Socket service not available:', data.message);
      return;
    }
  } catch (error) {
    console.log('❌ Failed to connect to API:', error.message);
    return;
  }
  
  // Test 2: Create a test room
  console.log('\n2. Creating test room...');
  let roomId, shareToken;
  try {
    const response = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You might need a real token
      },
      body: JSON.stringify({
        name: 'Live Viewers Test Room',
        description: 'Testing live viewers functionality'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      roomId = data.data.id;
      shareToken = data.data.shareToken;
      console.log('✅ Test room created:', roomId);
      console.log('🔑 Share token:', shareToken);
    } else {
      console.log('❌ Failed to create room:', data.message);
      return;
    }
  } catch (error) {
    console.log('❌ Failed to create room:', error.message);
    return;
  }
  
  // Test 3: Connect multiple socket clients
  console.log('\n3. Testing multiple socket connections...');
  
  const clients = [];
  const userCounts = [];
  
  // Create 3 test clients
  for (let i = 0; i < 3; i++) {
    const client = io(SOCKET_URL, {
      auth: {
        token: 'test-token'
      }
    });
    
    client.on('connect', () => {
      console.log(`✅ Client ${i + 1} connected: ${client.id}`);
    });
    
    client.on('user-count', (count) => {
      console.log(`📊 Client ${i + 1} received user-count: ${count}`);
      userCounts.push(count);
    });
    
    client.on('test-event', (data) => {
      console.log(`🧪 Client ${i + 1} received test-event:`, data);
    });
    
    client.on('error', (error) => {
      console.log(`❌ Client ${i + 1} error:`, error);
    });
    
    clients.push(client);
  }
  
  // Wait for all clients to connect
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Join room with all clients
  console.log('\n4. Joining room with all clients...');
  
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    client.emit('join-room', { shareToken });
    console.log(`🔗 Client ${i + 1} joining room...`);
    
    // Wait between joins to see user count updates
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Wait for all user-count events
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 5: Check final connection stats
  console.log('\n5. Checking final connection stats...');
  try {
    const response = await fetch(`${API_BASE}/api/rooms/${roomId}/connections`);
    const data = await response.json();
    
    if (data.success) {
      console.log('📊 Final connection stats:', data.data);
      console.log('📈 User count events received:', userCounts);
      
      if (data.data.connectedUsers === 3) {
        console.log('✅ Live viewers functionality is working correctly!');
      } else {
        console.log('❌ Expected 3 users, got:', data.data.connectedUsers);
      }
    } else {
      console.log('❌ Failed to get connection stats:', data.message);
    }
  } catch (error) {
    console.log('❌ Failed to get connection stats:', error.message);
  }
  
  // Test 6: Disconnect clients one by one
  console.log('\n6. Testing disconnections...');
  
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    console.log(`🔌 Disconnecting client ${i + 1}...`);
    client.disconnect();
    
    // Wait to see user count updates
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Wait for all disconnect events
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 7: Check final stats after disconnections
  console.log('\n7. Checking stats after disconnections...');
  try {
    const response = await fetch(`${API_BASE}/api/rooms/${roomId}/connections`);
    const data = await response.json();
    
    if (data.success) {
      console.log('📊 Final stats after disconnections:', data.data);
      
      if (data.data.connectedUsers === 0) {
        console.log('✅ Disconnections handled correctly!');
      } else {
        console.log('❌ Expected 0 users, got:', data.data.connectedUsers);
      }
    } else {
      console.log('❌ Failed to get final stats:', data.message);
    }
  } catch (error) {
    console.log('❌ Failed to get final stats:', error.message);
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testLiveViewers().catch(console.error);
