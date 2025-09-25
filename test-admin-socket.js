#!/usr/bin/env node

const { io } = require('socket.io-client');

// Test admin socket connection
const adminSocket = io('http://localhost:3001', {
  auth: { 
    token: 'your-admin-token-here' // You'll need to get a real token
  },
  autoConnect: true
});

const shareToken = '2ba6e609-c5e7-4ed3-a21f-bb5b9b3b8d56';

console.log('🔍 Testing Admin Socket Connection');

adminSocket.on('connect', () => {
  console.log('✅ Admin connected to server');
  adminSocket.emit('join-room', { shareToken, userId: 'admin-user' });
});

adminSocket.on('room-state', (data) => {
  console.log('📡 Admin joined room:', data.name, 'Room ID:', data.id);
  console.log('👑 Admin status:', data.isAdmin);
});

adminSocket.on('timer-started', (data) => {
  console.log('🟢 Admin received timer-started:', data);
});

adminSocket.onAny((eventName, ...args) => {
  console.log(`📨 Admin event: ${eventName}`, args);
});

console.log('⏳ Admin socket monitoring... (Press Ctrl+C to exit)');
