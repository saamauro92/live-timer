#!/usr/bin/env node

const { io } = require('socket.io-client');

const shareToken = '2ba6e609-c5e7-4ed3-a21f-bb5b9b3b8d56';

console.log('🔍 Testing Complete Flow');
console.log('=' .repeat(50));

// Create two sockets: one for admin, one for shareable link
const adminSocket = io('http://localhost:3001', {
  auth: { token: null },
  autoConnect: true
});

const shareableSocket = io('http://localhost:3001', {
  auth: { token: null },
  autoConnect: true
});

let adminRoomJoined = false;
let shareableRoomJoined = false;
let roomId = null;

// Admin socket
adminSocket.on('connect', () => {
  console.log('✅ Admin connected');
  adminSocket.emit('join-room', { shareToken, userId: 'admin' });
});

adminSocket.on('room-state', (data) => {
  console.log('📡 Admin joined room:', data.name, 'Room ID:', data.id);
  adminRoomJoined = true;
  roomId = data.id;
});

adminSocket.on('timer-started', (data) => {
  console.log('🟢 Admin received timer-started:', data);
});

// Shareable socket
shareableSocket.on('connect', () => {
  console.log('✅ Shareable connected');
  shareableSocket.emit('join-room', { shareToken, userId: null });
});

shareableSocket.on('room-state', (data) => {
  console.log('📡 Shareable joined room:', data.name, 'Room ID:', data.id);
  shareableRoomJoined = true;
});

shareableSocket.on('timer-started', (data) => {
  console.log('🟢 Shareable received timer-started:', data);
  console.log('✅ SUCCESS: Shareable link received timer event!');
});

shareableSocket.on('test-event', (data) => {
  console.log('🧪 Shareable received test-event:', data);
});

// Test manual timer event after both are connected
setTimeout(async () => {
  if (adminRoomJoined && shareableRoomJoined) {
    console.log('🧪 Both sockets connected, testing manual timer event...');
    
    try {
      const response = await fetch(`http://localhost:3001/api/debug/test-timer-events/${shareToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      
      const data = await response.json();
      console.log('📤 Manual timer event sent:', data);
    } catch (error) {
      console.error('❌ Error sending manual timer event:', error);
    }
  }
}, 3000);

console.log('⏳ Testing complete flow... (Press Ctrl+C to exit)');
