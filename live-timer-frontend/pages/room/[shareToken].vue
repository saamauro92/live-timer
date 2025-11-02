<template>
  <!-- Stage Display Layout - Full Screen Black Background -->
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Logo - Top Left -->
    <div class="absolute top-6 left-6 z-10">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">LT</span>
        </div>
        <span class="ml-3 text-2xl font-semibold text-white">
          Live Timer
        </span>
      </div>
    </div>

    <!-- Timer Name - Top Center (show if timer exists and setting is enabled) -->
    <div v-if="showTimerName && currentTimerName && timer.id" class="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
      <h1 class="text-3xl font-bold text-center" :class="timer.isActive ? 'text-blue-400' : 'text-gray-400'">
        {{ currentTimerName }}
      </h1>
    </div>

    <!-- Main Timer Display - Center (show timer if it exists, or show empty state) -->
    <div v-if="timer.id" class="flex flex-col items-center justify-center min-h-screen">
      <!-- Large Countdown Timer -->
      <div 
        class="font-mono font-bold text-center transition-all duration-500"
        :class="[
          timer.isActive 
            ? (currentLiveMessage ? 'text-8xl' : 'text-9xl')
            : (currentLiveMessage ? 'text-7xl' : 'text-8xl'),
          timer.isActive ? 'text-white' : 'text-gray-500'
        ]"
        :style="{ 
          fontSize: timer.isActive 
            ? (currentLiveMessage ? '10rem' : '16rem')
            : (currentLiveMessage ? '8rem' : '12rem'),
          lineHeight: '1',
          textShadow: timer.isActive ? '0 0 30px rgba(255, 255, 255, 0.4)' : '0 0 15px rgba(255, 255, 255, 0.2)'
        }"
      >
        {{ formatTime(timer.remainingTime) }}
      </div>

      <!-- Completion Message Display (when timer reaches 0) -->
      <div 
        v-if="timer.remainingTime === 0 && timer.completionMessage" 
        class="mt-8 text-center animate-fadeIn"
        :style="{ 
          fontSize: '4rem',
          lineHeight: '1.2',
          textShadow: '0 0 15px rgba(251, 191, 36, 0.5)'
        }"
      >
        <div class="text-yellow-400 font-semibold">
          {{ timer.completionMessage }}
        </div>
      </div>

      <!-- Live Message Display (show only when timer is active) -->
      <div 
        v-if="currentLiveMessage && timer.remainingTime > 0" 
        class="mt-8 text-center animate-fadeIn"
        :style="{ 
          fontSize: '4rem',
          lineHeight: '1.2',
          textShadow: '0 0 15px rgba(34, 197, 94, 0.5)'
        }"
      >
        <div class="text-green-400 font-semibold">
          {{ currentLiveMessage }}
        </div>
      </div>

      <!-- Timer Status Indicator (only show when active) -->
      <div v-if="timer.isActive" class="mt-6 flex items-center justify-center">
        <div class="flex items-center text-green-400">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span class="text-lg font-medium">LIVE</span>
        </div>
      </div>
      <!-- Inactive Timer Indicator -->
      <div v-else-if="timer.remainingTime > 0" class="mt-6 flex items-center justify-center">
        <div class="flex items-center text-gray-500">
          <div class="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span class="text-lg font-medium">READY</span>
        </div>
      </div>
    </div>

    <!-- No Timer State (only show if no timer exists at all) -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen">
      <!-- Live Message Display (show even when no timer) -->
      <div 
        v-if="currentLiveMessage" 
        class="mb-12 text-center animate-fadeIn"
        :style="{ 
          fontSize: '4rem',
          lineHeight: '1.2',
          textShadow: '0 0 15px rgba(34, 197, 94, 0.5)'
        }"
      >
        <div class="text-green-400 font-semibold">
          {{ currentLiveMessage }}
        </div>
      </div>

      <div class="text-center">
        <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-4xl font-bold text-gray-300 mb-4">No Active Timer</h2>
        <p class="text-xl text-gray-400">Waiting for timer to start...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use a custom layout for stage display (no navigation)
definePageMeta({
  layout: false
})

const route = useRoute()
const { connect, joinRoom, leaveRoom: leaveRoomSocket, socket } = useSocket()

const room = ref(null)
const timer = ref({
  id: null,
  remainingTime: 0,
  isActive: false,
  isPaused: false,
  completionMessage: null
})
const members = ref([])
const currentLiveMessage = ref('')
const showTimerName = ref(true)
const currentTimerName = ref('')
const selectedTimerId = ref(null) // Track which timer was selected by admin
// Timer control variables removed - public room is read-only

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const fetchRoom = async () => {
  try {
    const response = await $fetch(`/api/rooms/share/${route.params.shareToken}`)
    room.value = response.data.room || response.data
    members.value = response.data.members || []
    
    // Load room settings
    showTimerName.value = room.value?.showTimerName ?? true
  } catch (error) {
    console.error('Error fetching room:', error)
    await navigateTo('/')
  }
}

const fetchTimer = async () => {
  try {
    const response = await $fetch(`/api/rooms/share/${route.params.shareToken}`)
    
    console.log('Full API response:', response)
    
    // API returns: { success: true, data: room } where room has timers
    const roomData = response.data
    const timers = roomData?.timers || []
    
    console.log('Fetched timers in share page:', timers)
    console.log('Room data:', roomData)
    
    if (timers.length > 0) {
      // Sort timers by order (ascending), then by createdAt as fallback
      const sortedTimers = [...timers].sort((a, b) => {
        const orderDiff = (a.order || 0) - (b.order || 0)
        if (orderDiff !== 0) return orderDiff
        // If order is same, sort by creation date
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return aDate - bDate
      })
      
      console.log('Sorted timers:', sortedTimers)
      
      // Priority: 1. Selected timer (if exists), 2. Active timer, 3. First timer
      let targetTimer = null
      
      // If there's a selected timer ID, try to find it first
      if (selectedTimerId.value) {
        targetTimer = sortedTimers.find(t => t.id === selectedTimerId.value)
      }
      
      // If no selected timer or selected timer not found, find active timer
      if (!targetTimer) {
        targetTimer = sortedTimers.find(t => t.isActive)
      }
      
      // If still no timer, use the first one
      if (!targetTimer) {
        targetTimer = sortedTimers[0]
      }
      
      console.log('Target timer selected:', targetTimer)
      
      if (targetTimer) {
        let remainingTime = 0
        
        if (targetTimer.isActive && targetTimer.endTimestamp) {
          const now = new Date().getTime()
          const endTime = new Date(targetTimer.endTimestamp).getTime()
          remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
        } else if (targetTimer.duration) {
          remainingTime = Math.floor(targetTimer.duration / 1000)
        }
        
        timer.value = {
          id: targetTimer.id,
          remainingTime: remainingTime,
          isActive: targetTimer.isActive || false,
          isPaused: !targetTimer.isActive && remainingTime > 0,
          completionMessage: targetTimer.completionMessage || null
        }
        
        // Set the current timer name
        currentTimerName.value = targetTimer.title || 'Timer'
        
        console.log('Timer set on initial load:', timer.value)
      } else {
        timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false, completionMessage: null }
        currentTimerName.value = ''
      }
    } else {
      timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false, completionMessage: null }
      currentTimerName.value = ''
      console.log('No timers found in room')
    }
  } catch (error) {
    console.error('Error fetching timer:', error)
    // Don't reset timer on error, keep whatever we have
  }
}

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Removed copyRoomCode and shareRoom functions - not needed for stage display

// Load current live message (for all users)
const loadCurrentLiveMessage = async () => {
  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${room.value?.id}/messages/live`)
    
    if (response.success && response.data.message) {
      currentLiveMessage.value = response.data.message
    }
  } catch (error) {
    console.error('Error loading live message:', error)
  }
}


// Socket event listeners
const setupSocketListeners = () => {
  if (socket.value) {
    
    // Essential socket event listeners for stage display
    
    socket.value.on('timer-update', (data) => {
      console.log('Timer update event:', data)
      if (data.roomId === room.value?.id || !room.value?.id) {
        // Only update if this is the currently displayed timer, or if no timer is displayed
        if (timer.value.id === data.id || !timer.value.id) {
          let remainingTime = 0
          
          if (data.isActive && data.endTimestamp) {
            const now = new Date().getTime()
            const endTime = new Date(data.endTimestamp).getTime()
            remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
          } else if (data.duration) {
            // Duration is in milliseconds, convert to seconds
            remainingTime = Math.floor(data.duration / 1000)
          } else if (timer.value.remainingTime > 0 && !data.isActive) {
            // Preserve current remaining time if duration not provided and timer not active
            remainingTime = timer.value.remainingTime
          }
          
          timer.value = {
            id: data.id,
            remainingTime: remainingTime,
            isActive: data.isActive || false,
            isPaused: !data.isActive && remainingTime > 0,
            completionMessage: data.completionMessage || timer.value.completionMessage || null
          }
          
          // Update current timer name if available (timer title was changed)
          if (data.title !== undefined) {
            currentTimerName.value = data.title || 'Timer'
          }
          
          console.log('Updated timer from timer-update:', timer.value)
        } else {
          // Timer was updated but it's not the currently displayed one
          // Check if we should switch to it (e.g., if it became active and current one is not)
          if (data.isActive && !timer.value.isActive) {
            // The updated timer became active, switch to it
            let remainingTime = 0
            if (data.endTimestamp) {
              const now = new Date().getTime()
              const endTime = new Date(data.endTimestamp).getTime()
              remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
            } else if (data.duration) {
              remainingTime = Math.floor(data.duration / 1000)
            }
            
            timer.value = {
              id: data.id,
              remainingTime: remainingTime,
              isActive: true,
              isPaused: false,
              completionMessage: data.completionMessage || timer.value.completionMessage || null
            }
            
            if (data.title !== undefined) {
              currentTimerName.value = data.title || 'Timer'
            }
            
            console.log('Switched to active timer from timer-update')
          }
        }
      }
    })
    
    socket.value.on('timer-finished', (data) => {
      if (data.roomId === room.value?.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
        timer.value.completionMessage = data.completionMessage || timer.value.completionMessage || null
      }
    })
    
    // Handle timer deletion - if current timer is deleted, select next available
    socket.value.on('timer-deleted', (data) => {
      console.log('Timer deleted event:', data)
      
      // Clear selected timer ID if it was the deleted one
      if (selectedTimerId.value === data.timerId) {
        selectedTimerId.value = null
      }
      
      // Always refresh timer state when any timer is deleted (data.timerId may not have roomId)
      // This ensures we get the updated timer list
      if (timer.value.id === data.timerId || data.timerId) {
        console.log('Timer was deleted, fetching updated state...')
        // Request fresh room state to get updated timer list
        if (socket.value && socket.value.connected) {
          socket.value.emit('request-sync')
        } else {
          // Fallback: refetch directly
          fetchTimer()
        }
      }
    })
    
    // Handle timer creation - refresh timer list
    socket.value.on('timer-created', (data) => {
      console.log('Timer created event:', data)
      if (data.roomId === room.value?.id || !room.value?.id) {
        // Request fresh room state to get updated timer list
        if (socket.value && socket.value.connected) {
          socket.value.emit('request-sync')
        } else {
          // Fallback: refetch directly
          fetchTimer()
        }
      }
    })
    
    // Handle timer selection - admin selected a timer to display
    socket.value.on('timer-selected', async (data) => {
      console.log('Timer selected event:', data)
      if (data.roomId === room.value?.id || !room.value?.id) {
        // Store the selected timer ID
        selectedTimerId.value = data.timerId
        
        // If we have timer data in room already, update immediately
        const timers = room.value?.timers || []
        const selectedTimer = timers.find(t => t.id === data.timerId)
        
        if (selectedTimer) {
          let remainingTime = 0
          if (selectedTimer.isActive && selectedTimer.endTimestamp) {
            const now = new Date().getTime()
            const endTime = new Date(selectedTimer.endTimestamp).getTime()
            remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
          } else if (selectedTimer.duration) {
            remainingTime = Math.floor(selectedTimer.duration / 1000)
          }
          
          timer.value = {
            id: selectedTimer.id,
            remainingTime: remainingTime,
            isActive: selectedTimer.isActive || false,
            isPaused: !selectedTimer.isActive && remainingTime > 0,
            completionMessage: selectedTimer.completionMessage || null
          }
          
          currentTimerName.value = selectedTimer.title || 'Timer'
          console.log('Updated timer from timer-selected event:', timer.value)
        } else {
          // Timer data not available yet, request sync
          if (socket.value && socket.value.connected) {
            socket.value.emit('request-sync')
          } else {
            await fetchTimer()
          }
        }
      }
    })
    
    // Handle real-time timer control events from admin
    socket.value.on('timer-started', (data) => {
      if (data.roomId === room.value?.id || !room.value?.id) {
        timer.value.isActive = data.isActive
        timer.value.isPaused = false
        timer.value.remainingTime = data.remainingTime
        if (data.isActive && !countdownInterval) {
          startCountdown()
        }
        // Update timer name if provided
        if (data.title) {
          currentTimerName.value = data.title
        }
      }
    })
    
    socket.value.on('timer-paused', (data) => {
      if (data.roomId === room.value?.id || !room.value?.id) {
        timer.value.isActive = data.isActive
        timer.value.isPaused = data.isPaused
        timer.value.remainingTime = data.remainingTime
        stopCountdown()
      }
    })
    
    socket.value.on('timer-stopped', (data) => {
      if (data.roomId === room.value?.id || !room.value?.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        // Preserve timer duration when stopped (don't reset to 0)
        // This allows the timer to still be displayed even when not active
        if (data.duration !== undefined) {
          timer.value.remainingTime = Math.floor(data.duration / 1000)
        } else if (timer.value.remainingTime === 0 && data.remainingTime !== undefined) {
          timer.value.remainingTime = data.remainingTime
        }
        // Only reset to 0 if explicitly finished/expired
        if (data.finished) {
          timer.value.remainingTime = 0
        }
        stopCountdown()
      }
    })
    
    socket.value.on('room-state', (data) => {
      // More robust room matching - check by ID or shareToken
      const isRoomMatch = 
        (data.id && room.value?.id && String(data.id) === String(room.value.id)) ||
        (data.shareToken && String(data.shareToken) === String(route.params.shareToken)) ||
        (data.shareToken && room.value?.shareToken && String(data.shareToken) === String(room.value.shareToken))
      
      if (isRoomMatch) {
        room.value = data
        
        // Update room settings - always update from room-state as it's the source of truth
        if (data.showTimerName !== undefined) {
          showTimerName.value = Boolean(data.showTimerName)
          console.log('Show timer name updated from room-state:', showTimerName.value)
        }
        
        const timers = data.timers || data.room?.timers || []
        
        console.log('Received room-state with timers:', timers)
        
        if (timers.length > 0) {
          // Sort timers by order (ascending), then by createdAt as fallback
          const sortedTimers = [...timers].sort((a, b) => {
            const orderDiff = (a.order || 0) - (b.order || 0)
            if (orderDiff !== 0) return orderDiff
            // If order is same, sort by creation date
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          })
          
          // Priority: 1. Selected timer (if exists), 2. Active timer, 3. First timer
          let targetTimer = null
          
          // If there's a selected timer ID, try to find it first
          if (selectedTimerId.value) {
            targetTimer = sortedTimers.find(t => t.id === selectedTimerId.value)
          }
          
          // If no selected timer or selected timer not found, find active timer
          if (!targetTimer) {
            targetTimer = sortedTimers.find(t => t.isActive)
          }
          
          // If still no timer, use the first one
          if (!targetTimer) {
            targetTimer = sortedTimers[0]
          }
          
          if (targetTimer) {
            let remainingTime = 0
            
            if (targetTimer.isActive) {
              const now = new Date().getTime()
              const endTime = new Date(targetTimer.endTimestamp).getTime()
              remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
            } else {
              remainingTime = Math.floor(targetTimer.duration / 1000)
            }
            
            timer.value = {
              id: targetTimer.id,
              remainingTime: remainingTime,
              isActive: targetTimer.isActive,
              isPaused: !targetTimer.isActive && remainingTime > 0,
              completionMessage: targetTimer.completionMessage || null
            }
            
            // Update current timer name
            currentTimerName.value = targetTimer.title || 'Timer'
            
            console.log('Timer updated from room-state:', timer.value)
          } else {
            timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false, completionMessage: null }
            currentTimerName.value = ''
          }
        } else {
          timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false, completionMessage: null }
          currentTimerName.value = ''
        }
      }
    })
    
    socket.value.on('member-joined', (data) => {
      if (data.roomId === room.value?.id) {
        members.value.push(data.member)
      }
    })
    
    socket.value.on('member-left', (data) => {
      if (data.roomId === room.value?.id) {
        members.value = members.value.filter(m => m.id !== data.memberId)
      }
    })
    
    // Handle live message updates (for all users)
    socket.value.on('live-message-updated', (data) => {
      if (data.roomId === room.value?.id) {
        currentLiveMessage.value = data.message || ''
      }
    })
    
    // Handle room setting changes
    socket.value.on('room-setting-changed', (data) => {
      console.log('Room setting changed event received:', data)
      console.log('Current room ID:', room.value?.id)
      console.log('Event room ID:', data.roomId)
      console.log('Current shareToken:', room.value?.shareToken)
      console.log('Event shareToken:', data.shareToken)
      console.log('Route shareToken:', route.params.shareToken)
      
      // More robust room matching - check all possible ways to match
      const eventRoomId = data.roomId ? String(data.roomId).trim() : ''
      const currentRoomId = room.value?.id ? String(room.value.id).trim() : ''
      const eventShareToken = data.shareToken ? String(data.shareToken).trim() : ''
      const currentShareToken = room.value?.shareToken ? String(room.value.shareToken).trim() : ''
      const routeShareToken = route.params.shareToken ? String(route.params.shareToken).trim() : ''
      
      // Check if the event is for this room by comparing IDs or shareToken
      const isRoomMatch = 
        (eventRoomId && currentRoomId && eventRoomId === currentRoomId) ||
        (eventRoomId && eventRoomId === routeShareToken) || // Sometimes roomId might match shareToken in edge cases
        (eventShareToken && eventShareToken === routeShareToken) ||
        (eventShareToken && currentShareToken && eventShareToken === currentShareToken) ||
        (eventRoomId && currentRoomId && eventRoomId.toLowerCase() === currentRoomId.toLowerCase()) // Case-insensitive match
      
      console.log('Room match result:', isRoomMatch)
      
      if (isRoomMatch) {
        console.log('Room match confirmed, updating setting:', data.setting, '=', data.value)
        if (data.setting === 'showTimerName') {
          showTimerName.value = Boolean(data.value)
          console.log('Show timer name updated to:', showTimerName.value)
        }
      } else {
        console.log('Room ID mismatch - ignoring event')
        console.log('Comparison details:', {
          eventRoomId,
          currentRoomId,
          eventShareToken,
          currentShareToken,
          routeShareToken,
          eventRoomIdMatchesCurrent: eventRoomId === currentRoomId,
          eventShareTokenMatchesRoute: eventShareToken === routeShareToken,
          eventShareTokenMatchesCurrent: eventShareToken === currentShareToken
        })
      }
    })
    
  }
}

// Timer countdown effect
let countdownInterval = null

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)
  
  countdownInterval = setInterval(() => {
    if (timer.value.isActive && timer.value.remainingTime > 0) {
      timer.value.remainingTime--
    } else if (timer.value.remainingTime <= 0) {
      timer.value.isActive = false
      timer.value.isPaused = false
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Watch for timer state changes
watch(() => timer.value.isActive, (isActive) => {
  if (isActive) {
    startCountdown()
  } else {
    stopCountdown()
  }
})

// Handle page visibility changes (navigation away/back)
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // User came back to the page, reconnect if needed
    if (!socket.value || !socket.value.connected) {
      connect().then(() => {
        setupSocketListeners()
        joinRoom({ shareToken: route.params.shareToken, userId: null })
      })
    }
  }
}

// Set up cleanup hooks first (before any async operations)
onUnmounted(() => {
  stopCountdown()
  leaveRoomSocket(room.value?.id)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Initialize with proper state management
onMounted(async () => {
  // Add visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // First, fetch room and timer data
  await Promise.all([
    fetchRoom(),
    fetchTimer()
  ])
  
  // Load live message after room is fetched
  if (room.value?.id) {
    await loadCurrentLiveMessage()
  }
  
  // Then connect to socket and join room
  await connect()
  setupSocketListeners()
  
  // Wait a bit for socket to be fully ready
  await new Promise(resolve => setTimeout(resolve, 500))
  
  joinRoom({ shareToken: route.params.shareToken, userId: null })
  
  // Request fresh room state from server to ensure we have the latest timer data
  setTimeout(() => {
    if (socket.value && socket.value.connected) {
      socket.value.emit('request-sync')
      console.log('Requested room state sync after connection')
    }
  }, 1000)
  
})

// Cleanup is now handled in onMounted

// SEO
useHead({
  title: computed(() => room.value ? `${room.value.name} - Live Timer` : 'Room - Live Timer')
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* Ensure full viewport height */
.min-h-screen {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Large timer text with proper scaling */
.font-mono {
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .text-9xl {
    font-size: 8rem !important;
  }
  .text-8xl {
    font-size: 6rem !important;
  }
}

@media (max-width: 480px) {
  .text-9xl {
    font-size: 6rem !important;
  }
  .text-8xl {
    font-size: 4rem !important;
  }
}
</style>
