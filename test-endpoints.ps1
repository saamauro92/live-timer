# Live Timer Server - Comprehensive Endpoint Testing Script
# This script tests all API endpoints systematically

Write-Host "=== Live Timer Server - Endpoint Testing ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "✅ Health Check: $($healthData.message)" -ForegroundColor Green
    Write-Host "   Uptime: $($healthData.uptime) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Create Room
Write-Host "2. Testing Room Creation..." -ForegroundColor Yellow
$roomData = @{
    name = "Test Room $(Get-Date -Format 'HH:mm:ss')"
    description = "Automated test room"
    ownerId = "550e8400-e29b-41d4-a716-446655440000"
} | ConvertTo-Json

try {
    $roomResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms" -Method POST -Body $roomData -ContentType "application/json"
    $room = $roomResponse.Content | ConvertFrom-Json
    $roomId = $room.data.id
    $shareToken = $room.data.shareToken
    Write-Host "✅ Room Created: $($room.data.name)" -ForegroundColor Green
    Write-Host "   Room ID: $roomId" -ForegroundColor Gray
    Write-Host "   Share Token: $shareToken" -ForegroundColor Gray
} catch {
    Write-Host "❌ Room Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Get Room by Share Token
Write-Host "3. Testing Get Room by Share Token..." -ForegroundColor Yellow
try {
    $getRoomResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$shareToken" -Method GET
    $roomData = $getRoomResponse.Content | ConvertFrom-Json
    Write-Host "✅ Room Retrieved: $($roomData.data.name)" -ForegroundColor Green
    Write-Host "   Timers Count: $($roomData.data.timers.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Room Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Create Timer
Write-Host "4. Testing Timer Creation..." -ForegroundColor Yellow
$timerData = @{
    title = "Test Timer"
    description = "Automated test timer"
    duration = 300000  # 5 minutes in milliseconds
} | ConvertTo-Json

try {
    $timerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$roomId/timers" -Method POST -Body $timerData -ContentType "application/json"
    $timer = $timerResponse.Content | ConvertFrom-Json
    $timerId = $timer.data.id
    Write-Host "✅ Timer Created: $($timer.data.title)" -ForegroundColor Green
    Write-Host "   Timer ID: $timerId" -ForegroundColor Gray
    Write-Host "   Duration: $($timer.data.duration)ms" -ForegroundColor Gray
} catch {
    Write-Host "❌ Timer Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get Timers for Room
Write-Host "5. Testing Get Timers..." -ForegroundColor Yellow
try {
    $getTimersResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$roomId/timers" -Method GET
    $timersData = $getTimersResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timers Retrieved: $($timersData.data.room.timers.Count) timers found" -ForegroundColor Green
    Write-Host "   Is Admin: $($timersData.data.isAdmin)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Timers Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Get Room Stats
Write-Host "6. Testing Room Stats..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$roomId/stats" -Method GET
    $statsData = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Room Stats Retrieved" -ForegroundColor Green
    Write-Host "   Total Timers: $($statsData.data.totalTimers)" -ForegroundColor Gray
    Write-Host "   Active Timers: $($statsData.data.activeTimers)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Room Stats Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Update Timer
Write-Host "7. Testing Timer Update..." -ForegroundColor Yellow
$updateTimerData = @{
    title = "Updated Test Timer"
    description = "Updated description"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/timers/$timerId" -Method PUT -Body $updateTimerData -ContentType "application/json"
    $updatedTimer = $updateResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timer Updated: $($updatedTimer.data.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Timer Update Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Start Timer
Write-Host "8. Testing Timer Start..." -ForegroundColor Yellow
try {
    $startResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/timers/$timerId/start" -Method POST
    $startData = $startResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timer Started: $($startData.message)" -ForegroundColor Green
    Write-Host "   Is Active: $($startData.data.isActive)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Timer Start Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 9: Pause Timer
Write-Host "9. Testing Timer Pause..." -ForegroundColor Yellow
try {
    $pauseResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/timers/$timerId/pause" -Method POST
    $pauseData = $pauseResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timer Paused: $($pauseData.message)" -ForegroundColor Green
    Write-Host "   Is Active: $($pauseData.data.isActive)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Timer Pause Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 10: Reset Timer
Write-Host "10. Testing Timer Reset..." -ForegroundColor Yellow
try {
    $resetResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/timers/$timerId/reset" -Method POST
    $resetData = $resetResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timer Reset: $($resetData.message)" -ForegroundColor Green
    Write-Host "   Is Active: $($resetData.data.isActive)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Timer Reset Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 11: Socket.IO Stats
Write-Host "11. Testing Socket.IO Stats..." -ForegroundColor Yellow
try {
    $socketStatsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/stats/socket" -Method GET
    $socketStatsData = $socketStatsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Socket Stats Retrieved" -ForegroundColor Green
    Write-Host "   Total Rooms: $($socketStatsData.data.totalRooms)" -ForegroundColor Gray
    Write-Host "   Total Connections: $($socketStatsData.data.totalConnections)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Socket Stats Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 12: Delete Timer
Write-Host "12. Testing Timer Deletion..." -ForegroundColor Yellow
try {
    $deleteTimerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/timers/$timerId" -Method DELETE
    $deleteData = $deleteTimerResponse.Content | ConvertFrom-Json
    Write-Host "✅ Timer Deleted: $($deleteData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Timer Deletion Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 13: Update Room
Write-Host "13. Testing Room Update..." -ForegroundColor Yellow
$updateRoomData = @{
    name = "Updated Test Room"
    description = "Updated room description"
} | ConvertTo-Json

try {
    $updateRoomResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$roomId" -Method PUT -Body $updateRoomData -ContentType "application/json"
    $updatedRoom = $updateRoomResponse.Content | ConvertFrom-Json
    Write-Host "✅ Room Updated: $($updatedRoom.data.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Room Update Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 14: Delete Room
Write-Host "14. Testing Room Deletion..." -ForegroundColor Yellow
try {
    $deleteRoomResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/rooms/$roomId" -Method DELETE
    $deleteRoomData = $deleteRoomResponse.Content | ConvertFrom-Json
    Write-Host "✅ Room Deleted: $($deleteRoomData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Room Deletion Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Endpoint Testing Complete ===" -ForegroundColor Green
Write-Host "All major API endpoints have been tested." -ForegroundColor White
