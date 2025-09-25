#!/usr/bin/env node

/**
 * Comprehensive debug script to test the complete socket flow
 * This will help us identify exactly where the issue is
 */

const { io } = require('socket.io-client');

const shareToken = process.argv[2];

if (!shareToken) {
  console.error('Usage: node debug-socket-flow.js <shareToken>');
  process.exit(1);
}

console.log('🔍 DEBUGGING SOCKET FLOW for shareToken:', shareToken);
console.log('=' .repeat(60));

const socket = io('http://localhost:3001', {
  auth: {
    token: null // No authentication for public access
  },
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000
});

let roomJoined = false;
let roomData = null;

socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('🔗 Joining room with shareToken:', shareToken);
  socket.emit('join-room', { shareToken, userId: null });
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('room-state', (data) => {
  console.log('📡 Received room-state:', {
    roomId: data.id,
    name: data.name,
    timersCount: data.timers?.length || 0,
    isAdmin: data.isAdmin
  });
  roomData = data;
  roomJoined = true;
  console.log('✅ Successfully joined room!');
  console.log('🏠 Room ID:', data.id);
  console.log('🔑 Share Token:', shareToken);
});

socket.on('test-event', (data) => {
  console.log('🧪 Received test-event:', data);
  if (data.message.includes('Timer')) {
    console.log('🎯 TIMER EVENT DETECTED:', data.message);
  }
});

socket.on('timer-started', (data) => {
  console.log('🟢 TIMER STARTED EVENT:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
  console.log('✅ Shareable link received timer start event!');
});

socket.on('timer-paused', (data) => {
  console.log('🟡 TIMER PAUSED EVENT:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
  console.log('✅ Shareable link received timer pause event!');
});

socket.on('timer-stopped', (data) => {
  console.log('🔴 TIMER STOPPED EVENT:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
  console.log('✅ Shareable link received timer stop event!');
});

socket.on('timer-update', (data) => {
  console.log('🔄 TIMER UPDATE EVENT:', {
    timerId: data.id,
    roomId: data.roomId,
    isActive: data.isActive,
    endTimestamp: data.endTimestamp
  });
});

socket.on('user-count', (count) => {
  console.log('👥 Users in room:', count);
});

// Log all events for debugging
socket.onAny((eventName, ...args) => {
  console.log(`📨 Received event: ${eventName}`, args);
});

// Test ping/pong
setTimeout(() => {
  console.log('🏓 Sending ping...');
  socket.emit('ping', { test: 'from debug script' });
}, 2000);

// Test request-sync
setTimeout(() => {
  console.log('📡 Requesting sync...');
  socket.emit('request-sync');
}, 3000);

// Test manual timer events after room is joined
setTimeout(async () => {
  if (roomJoined && roomData) {
    console.log('🧪 Testing manual timer events...');
    
    try {
      // Test timer start
      console.log('🟢 Testing timer start event...');
      const startResponse = await fetch(`http://localhost:3001/api/debug/test-timer-events/${shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      const startData = await startResponse.json();
      console.log('📤 Timer start test response:', startData);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test timer pause
      console.log('🟡 Testing timer pause event...');
      const pauseResponse = await fetch(`http://localhost:3001/api/debug/test-timer-events/${shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' })
      });
      const pauseData = await pauseResponse.json();
      console.log('📤 Timer pause test response:', pauseData);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test timer stop
      console.log('🔴 Testing timer stop event...');
      const stopResponse = await fetch(`http://localhost:3001/api/debug/test-timer-events/${shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      const stopData = await stopResponse.json();
      console.log('📤 Timer stop test response:', stopData);
      
    } catch (error) {
      console.error('❌ Error testing manual events:', error);
    }
  }
}, 5000);

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('⏳ Waiting for events... (Press Ctrl+C to exit)');
console.log('💡 This script will test both socket connection and manual timer events');
console.log('💡 Make sure your server is running on port 3001');
