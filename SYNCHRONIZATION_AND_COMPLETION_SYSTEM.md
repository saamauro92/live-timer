# Synchronization and Completion Message System

## Overview
This document describes how the timer synchronization and completion message system works in the Live Timer application.

## System Architecture

### 1. Synchronization Mode
When synchronization is enabled (`synchronizedMode = true`):
- **Auto-advance**: When one timer finishes, the next timer in the list automatically starts
- **Sequential execution**: Timers run one after another in the order they appear in the list
- **Real-time sync**: All connected users (admin and public) see the same timer state

### 2. Completion Message System
When a timer finishes and has a completion message:
- **Display**: The completion message is shown to all users (admin and public)
- **Duration**: Messages auto-hide after 10 seconds
- **Separation**: Completion messages are separate from live messages (which are for general announcements)

## Technical Implementation

### Backend Components

#### 1. Timer Expiration Detection (`src/services/socket.service.ts`)
```typescript
// Runs every 30 seconds to check for expired timers
private startExpiredTimerCleanup(): void {
  setInterval(async () => {
    const expiredTimers = await timerService.getExpiredTimers();
    for (const timer of expiredTimers) {
      await timerService.markAsExpired(timer.id);
      
      // Send timer-finished event with completion message
      this.emitToRoom(timer.roomId, 'timer-finished', {
        timerId: timer.id,
        title: timer.title,
        roomId: timer.roomId,
        completionMessage: timer.completionMessage
      });
      
      // Also send completion message event if there's a message
      if (timer.completionMessage) {
        this.emitToRoom(timer.roomId, 'timer-completion-message', {
          roomId: timer.roomId,
          timerId: timer.id,
          message: timer.completionMessage,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, 30000);
}
```

#### 2. Message Controller (`src/controllers/message.controller.ts`)
```typescript
// Broadcasts completion messages to all room members
async broadcastTimerCompletion(timerId: string, roomId: string, message: string): Promise<void> {
  const socketService = (global as any).socketService;
  if (socketService && message) {
    socketService.emitToRoom(roomId, 'timer-completion-message', {
      roomId,
      timerId,
      message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Frontend Components

#### 1. Admin Room Page (`live-timer-frontend/pages/rooms/[id].vue`)

**Synchronization Logic:**
```typescript
const setupSyncMode = () => {
  if (!synchronizedMode.value) return;
  
  // Watch for timer completion and auto-advance
  const checkForCompletion = () => {
    if (!currentPlayingTimerId.value) return;
    
    const currentTimer = timers.value.find(t => t.id === currentPlayingTimerId.value);
    if (!currentTimer || !currentTimer.isActive) {
      // Timer finished or stopped, move to next
      advanceToNextTimer();
    }
  };
  
  // Check every second
  const syncInterval = setInterval(checkForCompletion, 1000);
  window.syncInterval = syncInterval;
};

const advanceToNextTimer = () => {
  if (!synchronizedMode.value) return;
  
  const currentIndex = timers.value.findIndex(t => t.id === currentPlayingTimerId.value);
  const nextIndex = currentIndex + 1;
  
  if (nextIndex < timers.value.length) {
    // Move to next timer
    const nextTimer = timers.value[nextIndex];
    selectedTimerId.value = nextTimer.id;
    currentPlayingTimerId.value = nextTimer.id;
    
    // Auto-start the next timer
    startTimer(nextTimer.id);
  } else {
    // No more timers, sync sequence complete
    selectedTimerId.value = null;
    currentPlayingTimerId.value = null;
  }
};
```

**Completion Message Handling:**
```typescript
// Handle timer completion
socket.value.on('timer-finished', (data) => {
  if (data.roomId === route.params.id) {
    // Update timer state
    const timerIndex = timers.value.findIndex(t => t.id === data.timerId);
    if (timerIndex !== -1) {
      timers.value[timerIndex] = {
        ...timers.value[timerIndex],
        isActive: false,
        isPaused: false,
        remainingTime: 0
      };
      
      // Show completion message if it exists
      if (data.completionMessage) {
        showTimerCompletionMessage({
          completionMessage: data.completionMessage
        });
      }
    }
  }
});

const showTimerCompletionMessage = (timer) => {
  if (timer.completionMessage) {
    completionMessage.value = timer.completionMessage;
    showCompletionMessage.value = true;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      showCompletionMessage.value = false;
    }, 10000);
  }
};
```

#### 2. Public Room Page (`live-timer-frontend/pages/room/[shareToken].vue`)

**Completion Message Handling:**
```typescript
socket.value.on('timer-finished', (data) => {
  if (data.roomId === room.value?.id) {
    timer.value.isActive = false;
    timer.value.isPaused = false;
    timer.value.remainingTime = 0;
    
    // Show completion message if it exists
    if (data.completionMessage) {
      showTimerCompletionMessage({
        completionMessage: data.completionMessage
      });
    }
  }
});
```

## User Flow

### 1. Admin User (Room Owner)
1. **Enable Sync**: Toggle synchronization mode on
2. **Start First Timer**: Manually start the first timer
3. **Auto-advance**: System automatically starts next timer when current one finishes
4. **Completion Messages**: See completion messages when timers finish
5. **Live Messages**: Can send live messages to all users (separate from completion messages)

### 2. Public User (Viewer)
1. **View Timers**: See all timers in the room
2. **Real-time Updates**: See timer state changes in real-time
3. **Completion Messages**: See completion messages when timers finish
4. **Live Messages**: See live messages from admin (separate from completion messages)

## Key Features

### 1. Real-time Synchronization
- All users see the same timer state
- Changes are broadcast instantly via WebSocket
- Works across admin and public views

### 2. Completion Message System
- **Trigger**: When a timer finishes and has a completion message
- **Display**: Shows to all users for 10 seconds
- **Separation**: Different from live messages (which are for general announcements)

### 3. Auto-advance Logic
- **Sequential**: Timers run one after another
- **Automatic**: No manual intervention needed
- **Complete**: Stops when all timers are finished

## Socket Events

### 1. Timer Events
- `timer-started`: When a timer starts
- `timer-paused`: When a timer is paused
- `timer-stopped`: When a timer is stopped
- `timer-finished`: When a timer completes (includes completion message)
- `timer-update`: General timer state updates

### 2. Message Events
- `live-message-updated`: When live message changes
- `timer-completion-message`: When a timer completion message is broadcast

### 3. Room Events
- `room-state`: Current room and timer state
- `user-count`: Number of connected users

## Configuration

### 1. Sync Mode Toggle
```typescript
const toggleSynchronizedMode = () => {
  synchronizedMode.value = !synchronizedMode.value;
  
  if (!synchronizedMode.value) {
    // Turn off sync mode - stop auto-advance
    currentPlayingTimerId.value = null;
  } else if (selectedTimerId.value) {
    // Turn on sync mode - set up for current selection
    currentPlayingTimerId.value = selectedTimerId.value;
  }
};
```

### 2. Completion Message Settings
- **Auto-hide**: 10 seconds
- **Display**: Modal/overlay style
- **Content**: Custom message per timer

## Troubleshooting

### 1. Sync Not Working
- Check if `synchronizedMode.value` is true
- Verify `currentPlayingTimerId.value` is set
- Check if `setupSyncMode()` is called
- Verify timer completion detection

### 2. Completion Messages Not Showing
- Check if timer has `completionMessage` set
- Verify `timer-finished` event is received
- Check if `showTimerCompletionMessage()` is called
- Verify socket connection

### 3. Real-time Updates Not Working
- Check socket connection status
- Verify room ID matching
- Check event listeners are set up
- Verify backend is sending events

## Future Enhancements

### 1. Immediate Completion Detection
- Currently checks every 30 seconds
- Could be improved to detect completion immediately
- Consider using timer end timestamp comparison

### 2. Enhanced Completion Messages
- Rich text support
- Images/attachments
- Custom styling per message
- Message history

### 3. Advanced Sync Features
- Skip timers option
- Reorder timers during sync
- Pause/resume sync
- Sync statistics

## Files Modified

### Backend
- `src/services/socket.service.ts` - Timer expiration detection and completion message broadcasting
- `src/controllers/message.controller.ts` - Completion message broadcasting logic

### Frontend
- `live-timer-frontend/pages/rooms/[id].vue` - Admin room synchronization and completion handling
- `live-timer-frontend/pages/room/[shareToken].vue` - Public room completion message handling

## Testing

### 1. Sync Mode Testing
1. Create multiple timers
2. Enable sync mode
3. Start first timer
4. Verify auto-advance works
5. Check completion messages appear

### 2. Completion Message Testing
1. Set completion message on a timer
2. Start timer and let it finish
3. Verify message appears for all users
4. Check message auto-hides after 10 seconds

### 3. Real-time Testing
1. Open admin and public views
2. Start/stop timers from admin
3. Verify public view updates in real-time
4. Check completion messages appear in both views

---

**Last Updated**: 2025-09-27
**Version**: 1.0
**Status**: Working ✅
