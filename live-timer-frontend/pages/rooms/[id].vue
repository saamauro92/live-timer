<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Room Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ room?.name }}</h1>
          <p class="text-gray-600 dark:text-gray-300 mt-2">{{ room?.description }}</p>
          <div class="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Room Code: {{ room?.shareToken }}</span>
            <button 
              @click="copyRoomCode"
              class="ml-2 text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="shareRoom"
            class="btn-secondary"
          >
            Share Room
          </button>
          <button 
            @click="leaveRoom"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>

    <!-- Timer Section -->
    <div class="card p-8 mb-8">
      <div class="text-center">
        <div class="mb-6">
          <div class="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
            {{ formatTime(timer.remainingTime) }}
          </div>
          <!-- Debug info -->
          <div class="text-xs text-gray-500 mb-2">
            Debug: ID={{ timer.id }}, Active={{ timer.isActive }}, Paused={{ timer.isPaused }}, Time={{ timer.remainingTime }}s
            <br>
            <span v-if="timer.id" class="text-green-600">✓ Timer loaded from server</span>
            <span v-else class="text-red-600">✗ No timer found</span>
          </div>
          <div v-if="timer.isActive" class="flex items-center justify-center text-green-600 dark:text-green-400">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span class="font-medium">Timer Running</span>
          </div>
          <div v-else-if="timer.isPaused" class="flex items-center justify-center text-yellow-600 dark:text-yellow-400">
            <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span class="font-medium">Timer Paused</span>
          </div>
          <div v-else class="flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span class="font-medium">Timer Stopped</span>
          </div>
        </div>

        <!-- Timer Controls - Only for authenticated users -->
        <div v-if="isAuthenticated" class="flex justify-center space-x-4 mb-6">
          <button 
            v-if="!timer.isActive"
            @click="startTimer"
            class="btn-primary text-lg px-8 py-3"
          >
            Start Timer
          </button>
          <button 
            v-if="timer.isActive"
            @click="pauseTimer"
            class="btn-secondary text-lg px-8 py-3"
          >
            Pause
          </button>
          <button 
            v-if="timer.isPaused"
            @click="resumeTimer"
            class="btn-primary text-lg px-8 py-3"
          >
            Resume
          </button>
          <button 
            v-if="timer.isActive || timer.isPaused"
            @click="stopTimer"
            class="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3 rounded-lg"
          >
            Stop
          </button>
        </div>
        
        <!-- Public viewer message -->
        <div v-else class="text-center mb-6">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You're viewing this room as a guest. 
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800 underline">
              Sign in
            </NuxtLink> 
            to control the timer.
          </p>
        </div>

        <!-- Quick Timer Presets - Only for authenticated users -->
        <div v-if="isAuthenticated" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            @click="setTimer(5)"
            class="btn-secondary"
          >
            5 min
          </button>
          <button 
            @click="setTimer(15)"
            class="btn-secondary"
          >
            15 min
          </button>
          <button 
            @click="setTimer(25)"
            class="btn-secondary"
          >
            25 min
          </button>
          <button 
            @click="setTimer(60)"
            class="btn-secondary"
          >
            60 min
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Timer Duration - Only for authenticated users -->
    <div v-if="isAuthenticated" class="card p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Timer</h3>
      <div class="flex space-x-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minutes
          </label>
          <input
            v-model.number="customMinutes"
            type="number"
            min="1"
            max="1440"
            class="input-field"
            placeholder="Enter minutes"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seconds
          </label>
          <input
            v-model.number="customSeconds"
            type="number"
            min="0"
            max="59"
            class="input-field"
            placeholder="Enter seconds"
          />
        </div>
        <div class="flex items-end">
          <button 
            @click="setCustomTimer"
            class="btn-primary"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>

    <!-- Room Members -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Members</h3>
      <div v-if="members.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">No members in this room yet.</p>
      </div>
      <div v-else class="grid gap-3">
        <div 
          v-for="member in members" 
          :key="member.id"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                {{ member.name.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ member.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ member.email }}</p>
            </div>
          </div>
          <div v-if="member.isOnline" class="flex items-center text-green-600 dark:text-green-400">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span class="text-sm">Online</span>
          </div>
          <div v-else class="flex items-center text-gray-500 dark:text-gray-400">
            <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span class="text-sm">Offline</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Check authentication status for UI purposes only
const { isAuthenticated } = useAuth()

const route = useRoute()
// Removed useApi() - using $fetch directly
const { connect, joinRoom, leaveRoom: leaveRoomSocket, socket } = useSocket()

const room = ref(null)
const timer = ref({
  id: null,
  remainingTime: 0,
  isActive: false,
  isPaused: false
})
const members = ref([])
const customMinutes = ref(25)
const customSeconds = ref(0)

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const fetchRoom = async () => {
  try {
    const response = await $fetch(`/api/rooms/${route.params.id}`)
    console.log('Room response:', response)
  
    room.value = response.data.room
    members.value = response.data.members || []
    
    // Debug: Log the share token
    console.log('Room shareToken:', room.value?.shareToken)
    console.log('Room ID:', room.value?.id)
    console.log('Full room data:', room.value)
  } catch (error) {
    console.error('Error fetching room:', error)
    await navigateTo('/rooms')
  }
}

const fetchTimer = async () => {
  try {
    const response = await $fetch(`/api/rooms/${route.params.id}/timers`)
    console.log('Fetched timers:', response.data)
    
    // Handle the correct data structure: data.room.timers
    const timers = response.data.room?.timers || response.data.timers || []
    console.log(timers  ,' TIMERS ----------------------------------')
    if (timers.length > 0) {
      // Get the most recent timer (last in array)
      const latestTimer = timers[timers.length - 1]
      
      let remainingTime = 0
      
      if (latestTimer.isActive) {
        // Timer is running - calculate remaining time from endTimestamp
        const now = new Date().getTime()
        const endTime = new Date(latestTimer.endTimestamp).getTime()
        remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
      } else {
        // Timer is not active - use duration field (convert from milliseconds to seconds)
        remainingTime = Math.floor(latestTimer.duration / 1000)
      }
      
      timer.value = {
        id: latestTimer.id,
        remainingTime: remainingTime,
        isActive: latestTimer.isActive,
        isPaused: !latestTimer.isActive && remainingTime > 0
      }
      
      console.log('Loaded timer:', timer.value)
      console.log('Timer details:', {
        id: latestTimer.id,
        endTimestamp: latestTimer.endTimestamp,
        duration: latestTimer.duration,
        isActive: latestTimer.isActive,
        calculatedRemaining: remainingTime,
        durationInSeconds: Math.floor(latestTimer.duration / 1000)
      })
    } else {
      timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false }
      console.log('No timers found, resetting timer state')
    }
  } catch (error) {
    console.error('Error fetching timer:', error)
  }
}

const setTimer = (minutes) => {
  timer.value.remainingTime = minutes * 60
}

const setCustomTimer = () => {
  const totalSeconds = (customMinutes.value * 60) + customSeconds.value
  timer.value.remainingTime = totalSeconds
}

const startTimer = async () => {
  // Only allow authenticated users to control timers
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    if (timer.value.remainingTime > 0) {
      // First create a timer if it doesn't exist
      if (!timer.value.id) {
        const response = await $fetch(`/api/rooms/${route.params.id}/timers`, {
          method: 'POST',
          body: {
            title: 'Room Timer',
            description: 'Timer for this room',
            duration: timer.value.remainingTime * 1000 // Convert to milliseconds
          }
        })
        timer.value.id = response.data.id
      }
      
      // Start the timer
      const startResponse = await $fetch(`/api/timers/${timer.value.id}/start`, {
        method: 'POST'
      })
      
      // Update timer state immediately
      if (startResponse.success && startResponse.data) {
        console.log('Timer started successfully:', startResponse.data)
        timer.value = {
          id: startResponse.data.id,
          remainingTime: Math.max(0, Math.floor((new Date(startResponse.data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: startResponse.data.isActive,
          isPaused: false
        }
        console.log('Updated timer state:', timer.value)
      }
    }
  } catch (error) {
    console.error('Error starting timer:', error)
  }
}

const pauseTimer = async () => {
  // Only allow authenticated users to control timers
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    if (timer.value.id) {
      const pauseResponse = await $fetch(`/api/timers/${timer.value.id}/pause`, {
        method: 'POST'
      })
      
      // Update timer state immediately
      if (pauseResponse.success && pauseResponse.data) {
        timer.value = {
          id: pauseResponse.data.id,
          remainingTime: Math.max(0, Math.floor((new Date(pauseResponse.data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: pauseResponse.data.isActive,
          isPaused: !pauseResponse.data.isActive && pauseResponse.data.duration > 0
        }
      }
    }
  } catch (error) {
    console.error('Error pausing timer:', error)
  }
}

const resumeTimer = async () => {
  // Only allow authenticated users to control timers
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    if (timer.value.id) {
      const resumeResponse = await $fetch(`/api/timers/${timer.value.id}/start`, {
        method: 'POST'
      })
      
      // Update timer state immediately
      if (resumeResponse.success && resumeResponse.data) {
        timer.value = {
          id: resumeResponse.data.id,
          remainingTime: Math.max(0, Math.floor((new Date(resumeResponse.data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: resumeResponse.data.isActive,
          isPaused: false
        }
      }
    }
  } catch (error) {
    console.error('Error resuming timer:', error)
  }
}

const stopTimer = async () => {
  // Only allow authenticated users to control timers
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    if (timer.value.id) {
      const resetResponse = await $fetch(`/api/timers/${timer.value.id}/reset`, {
        method: 'POST'
      })
      
      // Update timer state immediately - keep the timer but stop it
      if (resetResponse.success && resetResponse.data) {
        timer.value = {
          id: resetResponse.data.id,
          remainingTime: Math.max(0, Math.floor((new Date(resetResponse.data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: false,
          isPaused: false
        }
      }
    } else {
      // If no timer ID, just stop the current timer locally
      timer.value.isActive = false
      timer.value.isPaused = false
    }
  } catch (error) {
    console.error('Error stopping timer:', error)
    // Fallback: just stop the timer locally
    timer.value.isActive = false
    timer.value.isPaused = false
  }
}

const copyRoomCode = () => {
  navigator.clipboard.writeText(room.value.shareToken)
  // You could add a toast notification here
}

const shareRoom = () => {
  const shareUrl = `${window.location.origin}/room/${room.value.shareToken}`
  console.log('Share URL:', shareUrl)
  console.log('Share Token:', room.value.shareToken)
  navigator.clipboard.writeText(shareUrl)
  alert(`Room shared! URL copied to clipboard: ${shareUrl}`)
}

const leaveRoom = async () => {
  if (confirm('Are you sure you want to leave this room?')) {
    try {
      await api(`/rooms/${route.params.id}/leave`, { method: 'POST' })
      leaveRoomSocket(route.params.id)
      await navigateTo('/rooms')
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }
}

// Socket event listeners with robust state management
const setupSocketListeners = () => {
  const { socket } = useSocket()
  
  if (socket.value) {
    // Handle timer updates with proper state management
    socket.value.on('timer-update', (data) => {
      console.log('Received timer-update:', data)
      if (data.roomId === route.params.id) {
        const newTimerState = {
          id: data.id,
          remainingTime: Math.max(0, Math.floor((new Date(data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: data.isActive,
          isPaused: !data.isActive && data.duration > 0
        }
        
        // Only update if state actually changed
        if (JSON.stringify(timer.value) !== JSON.stringify(newTimerState)) {
          timer.value = newTimerState
          console.log('Updated timer from socket:', timer.value)
        }
      }
    })
    
    // Handle timer creation
    socket.value.on('timer-created', (data) => {
      console.log('Timer created:', data)
      if (data.roomId === route.params.id) {
        timer.value.id = data.id
      }
    })
    
    // Handle timer completion
    socket.value.on('timer-finished', (data) => {
      console.log('Timer finished:', data)
      if (data.roomId === route.params.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
      }
    })
    
    // Handle real-time timer control events
    socket.value.on('timer-started', (data) => {
      console.log('🔴 Timer started via socket:', data)
      console.log('🔴 Current room ID:', route.params.id)
      console.log('🔴 Data room ID:', data.roomId)
      if (data.roomId === route.params.id) {
        console.log('✅ Timer started event matches room, updating timer state')
        timer.value.isActive = data.isActive
        timer.value.isPaused = false
        timer.value.remainingTime = data.remainingTime
        // Start countdown if not already running
        if (data.isActive && !countdownInterval) {
          console.log('✅ Starting countdown for timer')
          startCountdown()
        }
      } else {
        console.log('❌ Timer started event does not match room')
      }
    })
    
    socket.value.on('timer-paused', (data) => {
      console.log('Timer paused via socket:', data)
      if (data.roomId === route.params.id) {
        timer.value.isActive = data.isActive
        timer.value.isPaused = data.isPaused
        timer.value.remainingTime = data.remainingTime
        // Stop countdown
        stopCountdown()
      }
    })
    
    socket.value.on('timer-stopped', (data) => {
      console.log('Timer stopped via socket:', data)
      if (data.roomId === route.params.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
        // Stop countdown
        stopCountdown()
      }
    })
    
    // Handle complete room state sync
    socket.value.on('room-state', (data) => {
      console.log('Received room-state:', data)
      if (data.id === route.params.id) {
        room.value = data
        
        // Handle the correct data structure: data.timers or data.room.timers
        const timers = data.timers || data.room?.timers || []
        
        if (timers.length > 0) {
          // Get the most recent timer (last in array)
          const latestTimer = timers[timers.length - 1]
          
          let remainingTime = 0
          
          if (latestTimer.isActive) {
            // Timer is running - calculate remaining time from endTimestamp
            const now = new Date().getTime()
            const endTime = new Date(latestTimer.endTimestamp).getTime()
            remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
          } else {
            // Timer is not active - use duration field (convert from milliseconds to seconds)
            remainingTime = Math.floor(latestTimer.duration / 1000)
          }
          
          const newTimerState = {
            id: latestTimer.id,
            remainingTime: remainingTime,
            isActive: latestTimer.isActive,
            isPaused: !latestTimer.isActive && remainingTime > 0
          }
          
          timer.value = newTimerState
          console.log('Synced timer from room-state:', timer.value)
        } else {
          // No timers in room
          timer.value = { id: null, remainingTime: 0, isActive: false, isPaused: false }
        }
      }
    })
    
    // Handle member events
    socket.value.on('member-joined', (data) => {
      console.log('Member joined:', data)
      if (data.roomId === route.params.id) {
        members.value.push(data.member)
      }
    })
    
    socket.value.on('member-left', (data) => {
      console.log('Member left:', data)
      if (data.roomId === route.params.id) {
        members.value = members.value.filter(m => m.id !== data.memberId)
      }
    })
    
    // Handle connection events
    socket.value.on('connect', () => {
      console.log('Socket connected, requesting room state...')
      // Request fresh state when reconnected
      setTimeout(() => {
        socket.value.emit('request-sync')
      }, 500)
    })
    
    // Test event listener for debugging
    socket.value.on('test-event', (data) => {
      console.log('🧪 TEST EVENT RECEIVED:', data)
    })
    
    socket.value.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    
    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
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
    console.log('Page became visible, syncing state...')
    // User came back to the page, sync state
    if (socket.value && socket.value.connected) {
      socket.value.emit('request-sync')
    } else {
      // Reconnect if needed
      connect().then(() => {
        setupSocketListeners()
        if (room.value?.shareToken) {
          joinRoom({ shareToken: room.value.shareToken, userId: null })
        }
        setTimeout(() => {
          if (socket.value) {
            socket.value.emit('request-sync')
          }
        }, 500)
      })
    }
  }
}

// Initialize with proper state management
onMounted(async () => {
  console.log('Initializing room page...')
  
  // Add visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // First, fetch room and timer data
  await Promise.all([
    fetchRoom(),
    fetchTimer()
  ])
  
  // Then connect to socket and join room
  await connect()
  setupSocketListeners()
  
  // Join room with proper data
  if (room.value?.shareToken) {
    joinRoom({ shareToken: room.value.shareToken, userId: null })
    console.log('Joined room with shareToken:', room.value.shareToken)
  }
  
  // Request fresh room state from server
  setTimeout(() => {
    if (socket.value) {
      socket.value.emit('request-sync')
    }
  }, 1000)
  
  // Set up periodic sync to ensure state consistency
  const syncInterval = setInterval(() => {
    if (socket.value && socket.value.connected) {
      socket.value.emit('request-sync')
    }
  }, 30000) // Sync every 30 seconds
  
  // Store interval for cleanup
  onUnmounted(() => {
    clearInterval(syncInterval)
  })
})

// Cleanup
onUnmounted(() => {
  stopCountdown()
  leaveRoomSocket(route.params.id)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})


// SEO
useHead({
  title: computed(() => room.value ? `${room.value.name} - Live Timer` : 'Room - Live Timer')
})
</script>
