#!/usr/bin/env node

const { io } = require('socket.io-client');

const shareToken = '2ba6e609-c5e7-4ed3-a21f-bb5b9b3b8d56';

console.log('🔍 Simple Socket Test for shareToken:', shareToken);

const socket = io('http://localhost:3001', {
  auth: { token: null },
  autoConnect: true
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('join-room', { shareToken, userId: null });
});

socket.on('room-state', (data) => {
  console.log('📡 Room joined:', data.name, 'Room ID:', data.id);
});

socket.on('timer-started', (data) => {
  console.log('🟢 TIMER STARTED EVENT RECEIVED!', data);
});

socket.on('timer-paused', (data) => {
  console.log('🟡 TIMER PAUSED EVENT RECEIVED!', data);
});

socket.on('timer-stopped', (data) => {
  console.log('🔴 TIMER STOPPED EVENT RECEIVED!', data);
});

socket.on('test-event', (data) => {
  console.log('🧪 TEST EVENT RECEIVED!', data);
});

socket.onAny((eventName, ...args) => {
  console.log(`📨 Event: ${eventName}`, args);
});

console.log('⏳ Monitoring for events... (Press Ctrl+C to exit)');
