#!/usr/bin/env node

/**
 * Debug script to test socket connection and events
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';
const ROOM_SHARE_TOKEN = process.argv[2] || 'test-room-token';

console.log('🔍 Debug Socket Connection');
console.log('========================');
console.log(`Socket URL: ${SOCKET_URL}`);
console.log(`Room Token: ${ROOM_SHARE_TOKEN}`);
console.log('');

// Create socket connection
const socket = io(SOCKET_URL, {
  auth: {
    // No token for anonymous connection
  },
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  console.log('🔗 Joining room...');
  socket.emit('join-room', { shareToken: ROOM_SHARE_TOKEN });
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Room events
socket.on('room-state', (data) => {
  console.log('🏠 Room state received:', data);
});

socket.on('user-count', (count) => {
  console.log('👥 User count:', count);
});

socket.on('user-count-update', (data) => {
  console.log('👥 User count update:', data);
});

socket.on('user-joined', (data) => {
  console.log('➕ User joined:', data);
});

socket.on('user-left', (data) => {
  console.log('➖ User left:', data);
});

socket.on('test-event', (data) => {
  console.log('🧪 Test event:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('⏰ 10 seconds elapsed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000);

console.log('⏳ Waiting for connection...');
