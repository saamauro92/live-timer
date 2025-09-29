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

    <!-- Timer Name - Top Center (only show if timer is active) -->
    <div v-if="showTimerName && currentTimerName && timer.isActive" class="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
      <h1 class="text-3xl font-bold text-blue-400 text-center">
        {{ currentTimerName }}
      </h1>
    </div>

    <!-- Main Timer Display - Center (only show active timer) -->
    <div v-if="timer.isActive" class="flex flex-col items-center justify-center min-h-screen">
      <!-- Large Countdown Timer -->
      <div 
        class="font-mono font-bold text-center transition-all duration-500"
        :class="currentLiveMessage ? 'text-8xl' : 'text-9xl'"
        :style="{ 
          fontSize: currentLiveMessage ? '10rem' : '16rem',
          lineHeight: '1',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.4)'
        }"
      >
        {{ formatTime(timer.remainingTime) }}
      </div>

      <!-- Live Message Display -->
      <div 
        v-if="currentLiveMessage" 
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

      <!-- Timer Status Indicator (Small) -->
      <div class="mt-6 flex items-center justify-center">
        <div class="flex items-center text-green-400">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span class="text-lg font-medium">LIVE</span>
        </div>
      </div>
    </div>

    <!-- No Active Timer State -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen">
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
  isPaused: false
})
const members = ref([])
const currentLiveMessage = ref('')
const showTimerName = ref(true)
const currentTimerName = ref('')
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
    
    const timers = response.data.room?.timers || response.data.timers || []
    
    if (timers.length > 0) {
      const latestTimer = timers[timers.length - 1]
      
      let remainingTime = 0
      
      if (latestTimer.isActive) {
        const now = new Date().getTime()
        const endTime = new Date(latestTimer.endTimestamp).getTime()
        remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
      } else {
        remainingTime = Math.floor(latestTimer.duration / 1000)
      }
      
      timer.value = {
        id: latestTimer.id,
        remainingTime: remainingTime,
        isActive: latestTimer.isActive,
        isPaused: !latestTimer.isActive && remainingTime > 0
      }
      
      // Set the current timer name
      currentTimerName.value = latestTimer.title || 'Timer'
    } else {
      timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false }
      currentTimerName.value = ''
    }
  } catch (error) {
    console.error('Error fetching timer:', error)
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
      if (data.roomId === room.value?.id) {
        timer.value = {
          id: data.id,
          remainingTime: Math.max(0, Math.floor((new Date(data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: data.isActive,
          isPaused: !data.isActive && data.duration > 0
        }
        
        // Update current timer name if available
        if (data.title) {
          currentTimerName.value = data.title
        }
      }
    })
    
    socket.value.on('timer-finished', (data) => {
      if (data.roomId === room.value?.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
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
        timer.value.remainingTime = 0
        stopCountdown()
      }
    })
    
    socket.value.on('room-state', (data) => {
      if (data.id === room.value?.id) {
        room.value = data
        
        // Update room settings
        showTimerName.value = data.showTimerName ?? true
        
        const timers = data.timers || data.room?.timers || []
        
        if (timers.length > 0) {
          // Show the latest active timer, or the first timer if none are active
          const targetTimer = timers.find(t => t.isActive) || timers[timers.length - 1]
          
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
              isPaused: !targetTimer.isActive && remainingTime > 0
            }
            
            // Update current timer name
            currentTimerName.value = targetTimer.title || 'Timer'
          } else {
            timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false }
            currentTimerName.value = ''
          }
        } else {
          timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false }
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
      if (data.roomId === room.value?.id) {
        if (data.setting === 'showTimerName') {
          showTimerName.value = data.value
        }
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
