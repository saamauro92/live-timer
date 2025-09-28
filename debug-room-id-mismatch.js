#!/usr/bin/env node

/**
 * Debug script to check room ID format mismatch
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';
const ROOM_SHARE_TOKEN = '092d826a-a42d-4cd0-a593-81715eb5df61';

console.log('🔍 Debug Room ID Mismatch');
console.log('========================');
console.log(`Socket URL: ${SOCKET_URL}`);
console.log(`Room Share Token: ${ROOM_SHARE_TOKEN}`);
console.log('');

// Create socket connection
const socket = io(SOCKET_URL, {
  auth: {},
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000
});

let roomId = null;

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
  console.log('🏠 Room state received');
  roomId = data.id;
  console.log('📋 Room ID from backend:', roomId);
  console.log('📋 Room ID type:', typeof roomId);
  console.log('📋 Room ID length:', roomId.length);
});

socket.on('user-count', (count) => {
  console.log('👥 User count:', count);
});

socket.on('user-count-update', (data) => {
  console.log('👥 User count update received');
  console.log('📋 Data roomId:', data.roomId);
  console.log('📋 Data roomId type:', typeof data.roomId);
  console.log('📋 Data roomId length:', data.roomId.length);
  console.log('📋 Room ID match with room-state:', data.roomId === roomId);
  console.log('📋 Count:', data.count);
  console.log('📋 Connections:', data.connections.length);
});

socket.on('user-joined', (data) => {
  console.log('➕ User joined received');
  console.log('📋 Data roomId:', data.roomId);
  console.log('📋 Data roomId type:', typeof data.roomId);
  console.log('📋 Data roomId length:', data.roomId.length);
  console.log('📋 Room ID match with room-state:', data.roomId === roomId);
  console.log('📋 Total users:', data.totalUsers);
  console.log('📋 Connection browser:', data.connection.browser);
  console.log('📋 Connection OS:', data.connection.os);
});

socket.on('user-left', (data) => {
  console.log('➖ User left received');
  console.log('📋 Data roomId:', data.roomId);
  console.log('📋 Data roomId type:', typeof data.roomId);
  console.log('📋 Data roomId length:', data.roomId.length);
  console.log('📋 Room ID match with room-state:', data.roomId === roomId);
  console.log('📋 Total users:', data.totalUsers);
  console.log('📋 Socket ID:', data.socketId);
});

socket.on('test-event', (data) => {
  console.log('🧪 Test event received');
  console.log('📋 Data roomId:', data.roomId);
  console.log('📋 Data roomId type:', typeof data.roomId);
  console.log('📋 Data roomId length:', data.roomId.length);
  console.log('📋 Room ID match with room-state:', data.roomId === roomId);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('⏰ 15 seconds elapsed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 15000);

console.log('⏳ Waiting for connection...');
