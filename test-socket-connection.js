#!/usr/bin/env node

/**
 * Test script to verify socket connection for shareable links
 * Usage: node test-socket-connection.js <shareToken>
 */

const { io } = require('socket.io-client');

const shareToken = process.argv[2];

if (!shareToken) {
  console.error('Usage: node test-socket-connection.js <shareToken>');
  process.exit(1);
}

console.log('🧪 Testing socket connection for shareToken:', shareToken);

const socket = io('http://localhost:3000', {
  auth: {
    token: null // No authentication for public access
  },
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000
});

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
});

socket.on('test-event', (data) => {
  console.log('🧪 Received test-event:', data);
});

socket.on('timer-started', (data) => {
  console.log('🟢 Timer started:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
});

socket.on('timer-paused', (data) => {
  console.log('🟡 Timer paused:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
});

socket.on('timer-stopped', (data) => {
  console.log('🔴 Timer stopped:', {
    timerId: data.timerId,
    roomId: data.roomId,
    isActive: data.isActive,
    remainingTime: data.remainingTime
  });
});

socket.on('timer-update', (data) => {
  console.log('🔄 Timer update:', {
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
  socket.emit('ping', { test: 'from test script' });
}, 2000);

// Test request-sync
setTimeout(() => {
  console.log('📡 Requesting sync...');
  socket.emit('request-sync');
}, 3000);

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('⏳ Waiting for events... (Press Ctrl+C to exit)');
