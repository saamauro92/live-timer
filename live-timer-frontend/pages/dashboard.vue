<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back, {{ user?.name }}!
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mt-2">
        Manage your timers and rooms from here.
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Timer</h3>
            <p class="text-gray-600 dark:text-gray-300">Start a 25-minute timer</p>
          </div>
        </div>
        <button 
          @click="startQuickTimer(25)"
          class="w-full mt-4 btn-primary"
        >
          Start 25min Timer
        </button>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create Room</h3>
            <p class="text-gray-600 dark:text-gray-300">Start a new team room</p>
          </div>
        </div>
        <button 
          @click="showCreateRoom = true"
          class="w-full mt-4 btn-primary"
        >
          Create Room
        </button>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Join Room</h3>
            <p class="text-gray-600 dark:text-gray-300">Enter a room code</p>
          </div>
        </div>
        <button 
          @click="showJoinRoom = true"
          class="w-full mt-4 btn-secondary"
        >
          Join Room
        </button>
      </div>
    </div>

    <!-- Active Timers -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Timers</h2>
      <div v-if="activeTimers.length === 0" class="card p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No active timers</h3>
        <p class="text-gray-600 dark:text-gray-300">Start a timer or join a room to see active timers here.</p>
      </div>
      
      <div v-else class="grid gap-4">
        <div 
          v-for="timer in activeTimers" 
          :key="timer.id"
          class="card p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ timer.roomName }}</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ formatTime(timer.remainingTime) }} remaining</p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="pauseTimer(timer.roomId)"
                class="btn-secondary"
              >
                Pause
              </button>
              <button 
                @click="stopTimer(timer.roomId)"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Rooms -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Rooms</h2>
      <div v-if="recentRooms.length === 0" class="card p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent rooms</h3>
        <p class="text-gray-600 dark:text-gray-300">Create or join a room to see it here.</p>
      </div>
      
      <div v-else class="grid gap-4">
        <div 
          v-for="room in recentRooms" 
          :key="room.id"
          class="card p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ room.name }}</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ room.memberCount }} members</p>
            </div>
            <button 
              @click="joinRoom(room.id)"
              class="btn-primary"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div v-if="showCreateRoom" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Room</h3>
        <form @submit.prevent="createRoom">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name
            </label>
            <input
              v-model="newRoom.name"
              type="text"
              required
              class="input-field"
              placeholder="Enter room name"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              @click="showCreateRoom = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="creatingRoom"
              class="btn-primary"
            >
              {{ creatingRoom ? 'Creating...' : 'Create Room' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Join Room Modal -->
    <div v-if="showJoinRoom" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Join Room</h3>
        <form @submit.prevent="joinRoomByCode">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <input
              v-model="roomCode"
              type="text"
              required
              class="input-field"
              placeholder="Enter room code"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              @click="showJoinRoom = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="joiningRoom"
              class="btn-primary"
            >
              {{ joiningRoom ? 'Joining...' : 'Join Room' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, isAuthenticated } = useAuth()

// Redirect if not authenticated
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    navigateTo('/login')
  }
}, { immediate: true })

const { connect, joinRoom, startTimer, stopTimer, pauseTimer } = useSocket()

// Connect to socket on mount
onMounted(() => {
  connect()
})

const activeTimers = ref([])
const recentRooms = ref([])
const showCreateRoom = ref(false)
const showJoinRoom = ref(false)
const creatingRoom = ref(false)
const joiningRoom = ref(false)

const newRoom = ref({
  name: ''
})

const roomCode = ref('')

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const startQuickTimer = (minutes) => {
  // Create a temporary room for quick timer
  const roomId = `quick-${Date.now()}`
  startTimer(roomId, minutes * 60)
}

const createRoom = async () => {
  creatingRoom.value = true
  try {
    const response = await $fetch('/api/rooms', {
      method: 'POST',
      body: newRoom.value
    })
    
    if (response.success) {
      showCreateRoom.value = false
      newRoom.value.name = ''
      await fetchRecentRooms()
    }
  } catch (error) {
    console.error('Error creating room:', error)
  }
  creatingRoom.value = false
}

const joinRoomByCode = async () => {
  joiningRoom.value = true
  try {
    const response = await $fetch(`/api/rooms/join/${roomCode.value}`, {
      method: 'POST'
    })
    
    if (response.success) {
      showJoinRoom.value = false
      roomCode.value = ''
      await navigateTo(`/rooms/${response.room.id}`)
    }
  } catch (error) {
    console.error('Error joining room:', error)
  }
  joiningRoom.value = false
}

const fetchRecentRooms = async () => {
  try {
    const response = await $fetch('/api/rooms/recent')
    recentRooms.value = response.rooms || []
  } catch (error) {
    console.error('Error fetching recent rooms:', error)
  }
}

const fetchActiveTimers = async () => {
  try {
    const response = await $fetch('/api/timers/active')
    activeTimers.value = response.timers || []
  } catch (error) {
    console.error('Error fetching active timers:', error)
  }
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchRecentRooms(),
    fetchActiveTimers()
  ])
})

// SEO
useHead({
  title: 'Dashboard - Live Timer'
})
</script>
