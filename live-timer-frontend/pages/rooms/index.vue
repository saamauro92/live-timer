<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Rooms</h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          Manage your team rooms and timers
        </p>
      </div>
      <button 
        @click="showCreateRoom = true"
        class="btn-primary"
      >
        Create Room
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">Loading rooms...</h3>
    </div>

    <!-- Empty State -->
    <div v-else-if="rooms.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No rooms yet</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">Create your first room to start collaborating with your team.</p>
      <button 
        @click="showCreateRoom = true"
        class="btn-primary"
      >
        Create Your First Room
      </button>
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="room in rooms" 
        :key="room.id"
        class="card p-6 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ room.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm">{{ room.description || 'No description' }}</p>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="copyRoomCode(room.shareToken)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy room code"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
            <button 
              @click="deleteRoom(room.id)"
              class="text-red-400 hover:text-red-600"
              title="Delete room"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Room Code: {{ room.shareToken }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span>Created: {{ formatDate(room.createdAt) }}</span>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <NuxtLink 
            :to="`/rooms/${room.id}`"
            class="flex-1 btn-primary text-center"
          >
            Enter Room
          </NuxtLink>
          <button 
            @click="shareRoom(room)"
            class="btn-secondary"
          >
            Share
          </button>
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
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              v-model="newRoom.description"
              class="input-field"
              rows="3"
              placeholder="Enter room description"
            ></textarea>
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
  </div>
</template>

<script setup>
// Redirect if not authenticated
const { isAuthenticated } = useAuth()

if (!isAuthenticated.value) {
  await navigateTo('/login')
}

const rooms = ref([])
const showCreateRoom = ref(false)
const creatingRoom = ref(false)
const loading = ref(true)

const newRoom = ref({
  name: '',
  description: ''
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const fetchRooms = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/rooms')
    console.log('Rooms response:', response)
    rooms.value = response.data.rooms || []
    console.log('Rooms array:', rooms.value)
  } catch (error) {
    console.error('Error fetching rooms:', error)
  } finally {
    loading.value = false
  }
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
      newRoom.value = { name: '', description: '' }
      await fetchRooms()
    }
  } catch (error) {
    console.error('Error creating room:', error)
  }
  creatingRoom.value = false
}

const deleteRoom = async (roomId) => {
  if (!confirm('Are you sure you want to delete this room?')) return
  
  try {
    await $fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
    await fetchRooms()
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

const copyRoomCode = (shareToken) => {
  navigator.clipboard.writeText(shareToken)
  // You could add a toast notification here
}

const shareRoom = (room) => {
  const url = `${window.location.origin}/rooms/${room.id}`
  navigator.clipboard.writeText(url)
  // You could add a toast notification here
}

// Fetch rooms on mount
onMounted(() => {
  fetchRooms()
})

// SEO
useHead({
  title: 'Rooms - Live Timer'
})
</script>
