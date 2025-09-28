<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Modern Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg class="w-10 h-10 mr-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Your Rooms
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Manage your team rooms and timers
          </p>
        </div>
        <button 
          @click="showCreateRoom = true"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Room
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Loading rooms...</h3>
        <p class="text-gray-600 dark:text-gray-400">Please wait while we fetch your rooms</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="rooms.length === 0" class="text-center py-16">
        <div class="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg class="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No rooms yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">Create your first room to start collaborating with your team.</p>
        <button 
          @click="showCreateRoom = true"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center mx-auto"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Your First Room
        </button>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="room in rooms" 
          :key="room.id"
          class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ room.name }}</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-300 text-sm ml-13">{{ room.description || 'No description' }}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="copyRoomCode(room.shareToken)"
                class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Copy room code"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button 
                @click="deleteRoom(room.id)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete room"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="mb-6 space-y-3">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
              <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span class="font-mono font-medium">{{ room.shareToken }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Created: {{ formatDate(room.createdAt) }}</span>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <NuxtLink 
              :to="`/rooms/${room.id}`"
              class="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Enter Room
            </NuxtLink>
            <button 
              @click="shareRoom(room)"
              class="bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 transform hover:scale-105 flex items-center"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Create Room Modal -->
      <div v-if="showCreateRoom" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Create New Room</h3>
          </div>
          <form @submit.prevent="createRoom" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Room Name
              </label>
              <input
                v-model="newRoom.name"
                type="text"
                required
                class="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Description (optional)
              </label>
              <textarea
                v-model="newRoom.description"
                class="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows="3"
                placeholder="Enter room description"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-4 pt-4">
              <button 
                type="button"
                @click="showCreateRoom = false"
                class="px-6 py-3 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="creatingRoom"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                <div class="flex items-center">
                  <svg v-if="creatingRoom" class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  {{ creatingRoom ? 'Creating...' : 'Create Room' }}
                </div>
              </button>
            </div>
          </form>
        </div>
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
