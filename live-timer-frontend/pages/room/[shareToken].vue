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

        <!-- Public View - No Timer Controls -->
        <div class="text-center text-gray-600 dark:text-gray-400 mb-6">
          <p class="text-lg mb-4">🔒 Timer controls are only available to authenticated users</p>
          <p class="text-sm">To control the timer, please <NuxtLink to="/login" class="text-blue-600 hover:underline">log in</NuxtLink></p>
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
// Timer control variables removed - public room is read-only

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const fetchRoom = async () => {
  try {
    const response = await $fetch(`/api/rooms/share/${route.params.shareToken}`)
    console.log('Room response:', response)
    room.value = response.data.room || response.data
    members.value = response.data.members || []
  } catch (error) {
    console.error('Error fetching room:', error)
    await navigateTo('/')
  }
}

const fetchTimer = async () => {
  try {
    // Use the specific share route to avoid conflicts with [id] route
    const response = await $fetch(`/api/rooms/share/${route.params.shareToken}`)
    console.log('Fetched room with timers:', response.data)
    
    // Handle the correct data structure: data.room.timers or data.timers
    const timers = response.data.room?.timers || response.data.timers || []
    console.log('Full response:', response)
    console.log(timers, ' TIMERS ----------------------------------')
    
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

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

// Timer control functions removed - public room is read-only

const copyRoomCode = () => {
  navigator.clipboard.writeText(room.value.shareToken)
  // You could add a toast notification here
}

const shareRoom = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  // You could add a toast notification here
}

// Socket event listeners
const setupSocketListeners = () => {
  console.log('🔧 Setting up socket listeners...')
  console.log('🔧 Socket available:', !!socket.value)
  console.log('🔧 Socket connected:', socket.value?.connected)
  
  if (socket.value) {
    // Add a catch-all listener for debugging
    socket.value.onAny((eventName, ...args) => {
      console.log('📨 Received socket event:', eventName, args)
    })
    
    socket.value.on('room-joined', (data) => {
      console.log('🏠 Room joined event received:', data)
    })
    
    socket.value.on('test-event', (data) => {
      console.log('🧪 Test event received:', data)
    })
    
    socket.value.on('pong', (data) => {
      console.log('🏓 Pong received:', data)
    })
    
    socket.value.on('room-state', (data) => {
      console.log('🏠 Room state received:', data)
    })
    
    socket.value.on('user-count', (data) => {
      console.log('👥 User count received:', data)
    })
    
    socket.value.on('sync-response', (data) => {
      console.log('🔄 Sync response received:', data)
    })
    
    socket.value.on('timer-finished', (data) => {
      console.log('🏁 Timer finished received:', data)
    })
    
    socket.value.on('timer-created', (data) => {
      console.log('🆕 Timer created received:', data)
    })
    
    socket.value.on('timer-stopped', (data) => {
      console.log('🔴 Timer stopped received:', data)
    })
    
    socket.value.on('timer-paused', (data) => {
      console.log('🟡 Timer paused received:', data)
    })
    
    socket.value.on('timer-started', (data) => {
      console.log('🟢 Timer started received:', data)
    })
    
    socket.value.on('timer-resumed', (data) => {
      console.log('▶️ Timer resumed received:', data)
    })
    
    socket.value.on('timer-reset', (data) => {
      console.log('🔄 Timer reset received:', data)
    })
    
    socket.value.on('timer-deleted', (data) => {
      console.log('🗑️ Timer deleted received:', data)
    })
    
    socket.value.on('timer-updated', (data) => {
      console.log('✏️ Timer updated received:', data)
    })
    
    socket.value.on('timer-created', (data) => {
      console.log('🆕 Timer created received:', data)
      if (data.roomId === room.value?.id) {
        timer.value.id = data.id
      }
    })
    
    socket.value.on('timer-update', (data) => {
      console.log('Received timer-update:', data)
      if (data.roomId === room.value?.id) {
        timer.value = {
          id: data.id,
          remainingTime: Math.max(0, Math.floor((new Date(data.endTimestamp).getTime() - new Date().getTime()) / 1000)),
          isActive: data.isActive,
          isPaused: !data.isActive && data.duration > 0
        }
        console.log('Updated timer from socket:', timer.value)
      }
    })
    
    socket.value.on('timer-finished', (data) => {
      console.log('🏁 Timer finished received:', data)
      if (data.roomId === room.value?.id) {
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
      }
    })
    
    // Handle real-time timer control events from admin
    socket.value.on('timer-started', (data) => {
      console.log('🟢 Timer started via socket (public):', data)
      console.log('🟢 Current room ID:', room.value?.id)
      console.log('🟢 Data room ID:', data.roomId)
      console.log('🟢 Room match check:', data.roomId === room.value?.id)
      console.log('🟢 ShareToken match check:', data.roomId === room.value?.id || data.shareToken === route.params.shareToken)
      
      // Accept events if room ID matches OR if we don't have room ID yet (initial connection)
      // TEMPORARY: Accept all events for debugging
      if (data.roomId === room.value?.id || !room.value?.id || true) {
        console.log('✅ Timer started event matches room (public), updating timer state')
        timer.value.isActive = data.isActive
        timer.value.isPaused = false
        timer.value.remainingTime = data.remainingTime
        // Start countdown if not already running
        if (data.isActive && !countdownInterval) {
          console.log('✅ Starting countdown for timer (public)')
          startCountdown()
        }
      } else {
        console.log('❌ Timer started event does not match room (public)')
        console.log('❌ Expected room ID:', room.value?.id)
        console.log('❌ Received room ID:', data.roomId)
        console.log('❌ ShareToken:', route.params.shareToken)
      }
    })
    
    socket.value.on('timer-paused', (data) => {
      console.log('🟡 Timer paused via socket (public):', data)
      console.log('🟡 Current room ID:', room.value?.id)
      console.log('🟡 Data room ID:', data.roomId)
      
      // Accept events if room ID matches OR if we don't have room ID yet (initial connection)
      // TEMPORARY: Accept all events for debugging
      if (data.roomId === room.value?.id || !room.value?.id || true) {
        console.log('✅ Timer paused event matches room (public), updating timer state')
        timer.value.isActive = data.isActive
        timer.value.isPaused = data.isPaused
        timer.value.remainingTime = data.remainingTime
        // Stop countdown
        stopCountdown()
      } else {
        console.log('❌ Timer paused event does not match room (public)')
      }
    })
    
    socket.value.on('timer-stopped', (data) => {
      console.log('🔴 Timer stopped via socket (public):', data)
      console.log('🔴 Current room ID:', room.value?.id)
      console.log('🔴 Data room ID:', data.roomId)
      
      // Accept events if room ID matches OR if we don't have room ID yet (initial connection)
      // TEMPORARY: Accept all events for debugging
      if (data.roomId === room.value?.id || !room.value?.id || true) {
        console.log('✅ Timer stopped event matches room (public), updating timer state')
        timer.value.isActive = false
        timer.value.isPaused = false
        timer.value.remainingTime = 0
        // Stop countdown
        stopCountdown()
      } else {
        console.log('❌ Timer stopped event does not match room (public)')
      }
    })
    
    socket.value.on('room-state', (data) => {
      console.log('Received room-state:', data)
      if (data.id === room.value?.id) {
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
    
    // Test event listener for debugging
    socket.value.on('test-event', (data) => {
      console.log('🧪 TEST EVENT RECEIVED (PUBLIC):', data)
    })
    
    // Connection debugging
    socket.value.on('connect', () => {
      console.log('🔌 PUBLIC ROOM: Socket connected!')
      console.log('🔌 PUBLIC ROOM: Socket ID:', socket.value.id)
    })
    
    socket.value.on('disconnect', () => {
      console.log('🔌 PUBLIC ROOM: Socket disconnected!')
    })
    
    socket.value.on('connect_error', (error) => {
      console.error('🔌 PUBLIC ROOM: Socket connection error:', error)
    })
    
    // Debug: Log ALL events received
    socket.value.onAny((eventName, ...args) => {
      console.log('🔍 PUBLIC ROOM: Received event:', eventName, args)
    })
    
    // Test if socket can receive any events at all
    socket.value.on('pong', (data) => {
      console.log('🏓 PONG received:', data)
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
        joinRoom({ shareToken: route.params.shareToken, userId: null })
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
  console.log('Initializing public room page...')
  
  // Add visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // First, fetch room and timer data
  await Promise.all([
    fetchRoom(),
    fetchTimer()
  ])
  
  // Then connect to socket and join room
  console.log('🔌 PUBLIC ROOM: Starting socket connection...')
  await connect()
  console.log('🔌 PUBLIC ROOM: Socket connected, setting up listeners...')
  setupSocketListeners()
  
  // Wait a bit for socket to be fully ready
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log('🔗 Joining room with shareToken:', route.params.shareToken)
  joinRoom({ shareToken: route.params.shareToken, userId: null })
  console.log('🔌 PUBLIC ROOM: Socket setup complete')
  
  // Request fresh room state from server
  setTimeout(() => {
    if (socket.value) {
      console.log('📡 Sending request-sync...')
      socket.value.emit('request-sync')
      
      // Test basic socket communication
      console.log('🏓 Sending ping...')
      socket.value.emit('ping', { test: 'frontend to backend' })
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
  leaveRoomSocket(room.value?.id)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// SEO
useHead({
  title: computed(() => room.value ? `${room.value.name} - Live Timer` : 'Room - Live Timer')
})
</script>
