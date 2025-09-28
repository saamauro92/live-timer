# Live Viewers Functionality - Testing Guide

## Overview
The live viewers functionality has been fixed and enhanced to properly track and display the number of users currently connected to each room in real-time.

## What Was Fixed

### Backend Issues Fixed:
1. **Missing socket.leave() call**: Added proper room leaving in disconnect handler
2. **Enhanced logging**: Added detailed logging for user-count broadcasts
3. **New API endpoint**: Added `/api/rooms/:id/connections` to get current connection stats
4. **Debug endpoints**: Added `/api/debug/connections` for troubleshooting

### Frontend Issues Fixed:
1. **Initial state**: Added `loadConnectionStats()` to initialize viewer count on page load
2. **Event listeners**: Added proper `user-count`, `test-event`, and `error` event handlers
3. **Real-time updates**: Live viewer count now updates automatically when users join/leave
4. **Error handling**: Added proper error handling for socket events

## How to Test

### Method 1: Manual Testing with Browser Tabs
1. **Start the application**:
   ```bash
   # Terminal 1 - Backend
   cd /home/maurichu/Desktop/mauro/live-timer
   npm run dev
   
   # Terminal 2 - Frontend
   cd /home/maurichu/Desktop/mauro/live-timer/live-timer-frontend
   npm run dev
   ```

2. **Open multiple browser tabs**:
   - Open 3-4 browser tabs
   - Navigate to the same room in each tab
   - Watch the "Live Viewers" counter in the left column

3. **Expected behavior**:
   - Counter should show the correct number of connected users
   - Counter should update in real-time when you open/close tabs
   - Each tab should show the same count

### Method 2: Automated Testing
1. **Run the test script**:
   ```bash
   cd /home/maurichu/Desktop/mauro/live-timer
   node test-live-viewers.js
   ```

2. **Expected output**:
   - Socket service availability check
   - Test room creation
   - Multiple client connections
   - User count updates
   - Disconnection handling

### Method 3: Debug Endpoints
1. **Check all connections**:
   ```bash
   curl http://localhost:3001/api/debug/connections
   ```

2. **Check specific room connections**:
   ```bash
   curl http://localhost:3001/api/rooms/{roomId}/connections
   ```

## Key Features

### Real-time Updates
- User count updates immediately when users join/leave
- No page refresh required
- Works across multiple browser tabs/windows

### Visual Indicators
- Animated pulse dot for "online" status
- Clear count display
- Empty state when no viewers

### Error Handling
- Graceful fallback if socket service is unavailable
- Proper error logging for debugging
- Connection retry logic

## Troubleshooting

### If live viewers count is not updating:
1. Check browser console for socket connection errors
2. Verify backend logs for user-count broadcasts
3. Test with debug endpoints to see actual connection counts
4. Ensure CORS settings allow your frontend URL

### If count shows 0 when users are connected:
1. Check if socket service is running
2. Verify room joining is successful (look for test-event logs)
3. Check if user-count events are being received

### Debug Commands:
```bash
# Check all room connections
curl http://localhost:3001/api/debug/connections

# Check specific room
curl http://localhost:3001/api/rooms/{roomId}/connections

# Check room stats (timers)
curl http://localhost:3001/api/rooms/{roomId}/stats
```

## Technical Details

### Backend Flow:
1. User joins room via socket
2. Socket service tracks connection in `roomConnections` Map
3. `user-count` event broadcasted to all room members
4. On disconnect, connection removed and count updated

### Frontend Flow:
1. Page loads and fetches initial connection stats
2. Socket connects and joins room
3. `user-count` events update the display
4. Real-time updates as users join/leave

### Data Structure:
```typescript
// Backend
roomConnections: Map<string, Set<string>> // roomId -> Set of socketIds

// Frontend
liveViewerCount: Ref<number> // Current viewer count
```

## Success Criteria
✅ Live viewer count displays correctly on page load  
✅ Count updates in real-time when users join/leave  
✅ Works across multiple browser tabs  
✅ Proper error handling and fallbacks  
✅ Debug endpoints for troubleshooting  
✅ Clean disconnect handling  
