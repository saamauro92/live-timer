<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Timer Creation (Smaller) -->
      <div class="lg:col-span-1">
        <div class="card p-6 mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Timer</h3>
          
          <!-- Timer Creation Form - Only for authenticated users -->
          <div v-if="isAuthenticated">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timer Name
              </label>
              <input
                v-model="newTimer.title"
                type="text"
                class="input-field w-full"
                placeholder="Enter timer name"
              />
            </div>

            <!-- Preset Duration Buttons -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Presets
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  @click="setPresetDuration(5)"
                  :class="['btn-secondary text-sm py-2', { 'bg-blue-500 text-white': newTimer.duration === 5 * 60 }]"
                >
                  5 min
                </button>
                <button 
                  @click="setPresetDuration(10)"
                  :class="['btn-secondary text-sm py-2', { 'bg-blue-500 text-white': newTimer.duration === 10 * 60 }]"
                >
                  10 min
                </button>
                <button 
                  @click="setPresetDuration(60)"
                  :class="['btn-secondary text-sm py-2', { 'bg-blue-500 text-white': newTimer.duration === 60 * 60 }]"
                >
                  1 hour
                </button>
                <button 
                  @click="showCustomDuration = !showCustomDuration"
                  :class="['btn-secondary text-sm py-2', { 'bg-blue-500 text-white': showCustomDuration }]"
                >
                  Custom
                </button>
              </div>
            </div>

            <!-- Custom Duration Input -->
            <div v-if="showCustomDuration" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Custom Duration
              </label>
              
              <!-- Time Input with Better UX -->
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                    <input
                      v-model.number="customMinutes"
                      type="number"
                      min="0"
                      max="1440"
                      class="input-field w-full text-center text-lg font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div class="text-2xl text-gray-400">:</div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Seconds</label>
                    <input
                      v-model.number="customSeconds"
                      type="number"
                      min="0"
                      max="59"
                      class="input-field w-full text-center text-lg font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <!-- Quick Duration Buttons -->
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="preset in customPresets" 
                    :key="preset.label"
                    @click="setCustomPreset(preset.minutes, preset.seconds)"
                    class="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    {{ preset.label }}
                  </button>
                </div>
                
                <!-- Total Duration Display -->
                <div class="text-center">
                  <div class="text-sm text-gray-500 dark:text-gray-400">Total Duration</div>
                  <div class="text-xl font-mono font-bold text-gray-900 dark:text-white">
                    {{ formatCustomDuration() }}
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex space-x-2">
                  <button 
                    @click="setCustomDuration"
                    :disabled="!isValidCustomDuration"
                    class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set Timer
                  </button>
                  <button 
                    @click="showCustomDuration = false"
                    class="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Create Timer Button -->
            <button 
              @click="createTimer"
              :disabled="!newTimer.title || !newTimer.duration"
              class="btn-primary w-full py-3 text-lg"
            >
              Create Timer
            </button>
          </div>
          
          <!-- Public viewer message -->
          <div v-else class="text-center">
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              You're viewing this room as a guest. 
              <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800 underline">
                Sign in
              </NuxtLink> 
              to create timers.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Timer List (Larger) -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Room Timers</h3>
            
            <!-- Master Controls -->
            <div v-if="isAuthenticated && timers.length > 0" class="flex items-center space-x-4">
              <!-- Sync Mode Toggle -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sync Mode:</label>
                <button 
                  @click="toggleSynchronizedMode"
                  :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors', 
                    synchronizedMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600']"
                >
                  <span 
                    :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      synchronizedMode ? 'translate-x-6' : 'translate-x-1']"
                  ></span>
                </button>
                <span class="text-xs text-gray-500">{{ synchronizedMode ? 'ON' : 'OFF' }}</span>
              </div>

              <!-- Master Play/Stop Controls (Music Player Style) -->
              <div class="flex items-center space-x-3">
                <!-- Play/Pause Button -->
                <button 
                  @click="playSelectedTimer"
                  :disabled="!selectedTimerId"
                  :class="['flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    getPlayButtonClass()
                  ]"
                >
                  <svg v-if="getPlayButtonIcon() === 'play'" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else-if="getPlayButtonIcon() === 'pause'" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>

                <!-- Stop Button -->
                <button 
                  @click="stopAllTimers"
                  class="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 hover:scale-105"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>

                <!-- Selected Timer Info -->
                <div v-if="selectedTimerId" class="text-sm text-gray-600 dark:text-gray-400">
                  <div class="font-medium">{{ getSelectedTimerName() }}</div>
                  <div class="text-xs">{{ getSelectedTimerStatus() }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timer List -->
          <div v-if="timers.length === 0" class="text-center py-12">
            <div class="text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-lg font-medium">No timers created yet</p>
              <p class="text-sm">Create your first timer using the panel on the left</p>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(timer, index) in timers" 
              :key="timer.id"
              @click="selectTimer(timer.id)"
              :class="['timer-item p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                selectedTimerId === timer.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <!-- Selection Indicator -->
                    <div class="flex items-center">
                      <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        selectedTimerId === timer.id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      ]">
                        <div v-if="selectedTimerId === timer.id" class="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <!-- Timer Info -->
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <h4 class="font-medium text-gray-900 dark:text-white">{{ timer.title }}</h4>
                        <div v-if="synchronizedMode" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          #{{ index + 1 }}
                        </div>
                      </div>
                      <div class="flex items-center space-x-4 mt-1">
                        <div class="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                          {{ formatTime(timer.remainingTime) }}
                        </div>
                        <div class="flex items-center space-x-2">
                          <div v-if="timer.isActive" class="flex items-center text-green-600 dark:text-green-400">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            <span class="text-sm">Running</span>
                          </div>
                          <div v-else-if="timer.isPaused" class="flex items-center text-yellow-600 dark:text-yellow-400">
                            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                            <span class="text-sm">Paused</span>
                          </div>
                          <div v-else class="flex items-center text-gray-500 dark:text-gray-400">
                            <div class="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            <span class="text-sm">Stopped</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Delete Button (only action available) -->
                <div v-if="isAuthenticated" class="flex items-center">
                  <button 
                    @click.stop="deleteTimer(timer.id)"
                    class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Message Panel - Redesigned -->
    <div v-if="isAuthenticated" class="card p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700">
      <div class="flex items-center space-x-2 mb-6">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Manage live messages and timer notifications</p>
        </div>
      </div>
      
      <!-- Live Message Section -->
      <div class="mb-8">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Live Broadcast</h4>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-start space-x-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Broadcast Message to All Viewers
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="liveMessage"
                  type="text"
                  class="input-field flex-1 text-lg"
                  placeholder="Type your live message here..."
                />
                <button 
                  @click="updateLiveMessage"
                  :disabled="!liveMessage.trim()"
                  class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  📢 Broadcast
                </button>
                <button 
                  @click="clearLiveMessage"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  🗑️ Clear
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This message will appear instantly for all viewers in the room
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timer Completion Messages Section -->
      <div>
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Timer Completion Messages</h4>
        </div>
        
        <div v-if="timers.length === 0" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div class="text-gray-400 dark:text-gray-500 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">No timers created yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Create timers to set completion messages</p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="timer in timers" 
            :key="timer.id"
            class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span class="text-purple-600 dark:text-purple-400 font-bold text-sm">
                  {{ timers.indexOf(timer) + 1 }}
                </span>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <h5 class="font-semibold text-gray-900 dark:text-white">{{ timer.title }}</h5>
                  <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    {{ formatTime(timer.remainingTime) }}
                  </span>
                </div>
                
                <div class="flex space-x-2">
                  <input
                    v-model="timer.completionMessage"
                    type="text"
                    class="input-field flex-1"
                    :placeholder="`Custom message when ${timer.title} finishes...`"
                  />
                  <button 
                    @click="updateTimerCompletionMessage(timer.id, timer.completionMessage)"
                    class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    💾 Save
                  </button>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This message will show when the timer completes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Message Display (for all users) -->
    <div v-if="currentLiveMessage" class="card p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Live Message:</span>
      </div>
      <p class="text-blue-900 dark:text-blue-100 mt-1">{{ currentLiveMessage }}</p>
    </div>

    <!-- Timer Completion Message Display -->
    <div v-if="showCompletionMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-lg font-semibold text-gray-900 dark:text-white">Timer Complete!</span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 mb-4">{{ completionMessage }}</p>
        <button 
          @click="showCompletionMessage = false"
          class="btn-primary w-full"
        >
          Continue
        </button>
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
const timers = ref([])
const members = ref([])

// Timer creation form
const newTimer = ref({
  title: '',
  duration: 0
})
const customMinutes = ref(25)
const customSeconds = ref(0)
const showCustomDuration = ref(false)

// Synchronized mode
const synchronizedMode = ref(false)
const selectedTimerId = ref(null)
const currentPlayingTimerId = ref(null)

// Custom timer presets
const customPresets = ref([
  { label: '2 min', minutes: 2, seconds: 0 },
  { label: '3 min', minutes: 3, seconds: 0 },
  { label: '7 min', minutes: 7, seconds: 0 },
  { label: '30 sec', minutes: 0, seconds: 30 },
  { label: '90 sec', minutes: 1, seconds: 30 },
  { label: '2.5 min', minutes: 2, seconds: 30 }
])

// Message system
const liveMessage = ref('')
const currentLiveMessage = ref('')
const showCompletionMessage = ref(false)
const completionMessage = ref('')

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

const fetchTimers = async () => {
  try {
    const response = await $fetch(`/api/rooms/${route.params.id}/timers`)
    console.log('Fetched timers:', response.data)
    
    // Handle the correct data structure: data.room.timers
    const fetchedTimers = response.data.room?.timers || response.data.timers || []
    console.log(fetchedTimers, ' TIMERS ----------------------------------')
    
    // Process each timer to calculate remaining time
    const processedTimers = fetchedTimers.map(timer => {
      let remainingTime = 0
      
      if (timer.isActive) {
        // Timer is running - calculate remaining time from endTimestamp
        const now = new Date().getTime()
        const endTime = new Date(timer.endTimestamp).getTime()
        remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
      } else {
        // Timer is not active - use duration field (convert from milliseconds to seconds)
        remainingTime = Math.floor(timer.duration / 1000)
      }
      
      return {
        id: timer.id,
        title: timer.title,
        description: timer.description,
        remainingTime: remainingTime,
        isActive: timer.isActive,
        isPaused: !timer.isActive && remainingTime > 0,
        duration: timer.duration,
        endTimestamp: timer.endTimestamp,
        order: timer.order || 0
      }
    })
    
    // Sort by order
    processedTimers.sort((a, b) => a.order - b.order)
    timers.value = processedTimers
    
    // Auto-select first timer if none selected
    if (timers.value.length > 0 && !selectedTimerId.value) {
      selectedTimerId.value = timers.value[0].id
    }
    
    console.log('Processed timers:', timers.value)
  } catch (error) {
    console.error('Error fetching timers:', error)
  }
}

// Timer creation methods
const setPresetDuration = (minutes) => {
  newTimer.value.duration = minutes * 60
  showCustomDuration.value = false
}

const setCustomDuration = () => {
  const totalSeconds = (customMinutes.value * 60) + customSeconds.value
  newTimer.value.duration = totalSeconds
}

// Custom timer UX methods
const setCustomPreset = (minutes, seconds) => {
  customMinutes.value = minutes
  customSeconds.value = seconds
}

const formatCustomDuration = () => {
  const totalSeconds = (customMinutes.value * 60) + customSeconds.value
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const isValidCustomDuration = computed(() => {
  const totalSeconds = (customMinutes.value * 60) + customSeconds.value
  return totalSeconds > 0 && totalSeconds <= 86400 // Max 24 hours
})

// Music player style methods
const getPlayButtonIcon = () => {
  if (!selectedTimerId.value) return 'play'
  
  const selectedTimer = timers.value.find(t => t.id === selectedTimerId.value)
  if (!selectedTimer) return 'play'
  
  if (selectedTimer.isActive) return 'pause'
  if (selectedTimer.isPaused) return 'play'
  return 'play'
}

const getPlayButtonClass = () => {
  if (!selectedTimerId.value) return 'bg-gray-400 text-white cursor-not-allowed'
  
  const selectedTimer = timers.value.find(t => t.id === selectedTimerId.value)
  if (!selectedTimer) return 'bg-gray-400 text-white cursor-not-allowed'
  
  if (selectedTimer.isActive) {
    return 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105'
  }
  return 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
}

const getSelectedTimerName = () => {
  if (!selectedTimerId.value) return ''
  const timer = timers.value.find(t => t.id === selectedTimerId.value)
  return timer ? timer.title : ''
}

const getSelectedTimerStatus = () => {
  if (!selectedTimerId.value) return ''
  const timer = timers.value.find(t => t.id === selectedTimerId.value)
  if (!timer) return ''
  
  if (timer.isActive) return 'Running'
  if (timer.isPaused) return 'Paused'
  return 'Ready'
}

// Message management methods
const updateLiveMessage = async () => {
  if (!isAuthenticated.value || !liveMessage.value.trim()) return
  
  try {
    const config = useRuntimeConfig()
    const token = useCookie('auth-token')
    
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${route.params.id}/messages/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: { message: liveMessage.value.trim() }
    })
    
    if (response.success) {
      currentLiveMessage.value = liveMessage.value.trim()
      liveMessage.value = ''
    }
  } catch (error) {
    console.error('Error updating live message:', error)
  }
}

const clearLiveMessage = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const config = useRuntimeConfig()
    const token = useCookie('auth-token')
    
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${route.params.id}/messages/live`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      currentLiveMessage.value = ''
      liveMessage.value = ''
    }
  } catch (error) {
    console.error('Error clearing live message:', error)
  }
}

const updateTimerCompletionMessage = async (timerId, message) => {
  if (!isAuthenticated.value) return
  
  try {
    const config = useRuntimeConfig()
    const token = useCookie('auth-token')
    
    const response = await $fetch(`${config.public.apiBase}/api/timers/${timerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: { completionMessage: message || null }
    })
    
    if (response.success) {
      // Update local timer data
      const timerIndex = timers.value.findIndex(t => t.id === timerId)
      if (timerIndex !== -1) {
        timers.value[timerIndex].completionMessage = message
      }
    }
  } catch (error) {
    console.error('Error updating timer completion message:', error)
  }
}

const showTimerCompletionMessage = (timer) => {
  console.log('🎉 Showing timer completion message:', timer)
  if (timer.completionMessage) {
    completionMessage.value = timer.completionMessage
    showCompletionMessage.value = true
    
    console.log('🎉 Completion message displayed:', timer.completionMessage)
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      showCompletionMessage.value = false
      console.log('🎉 Completion message auto-hidden')
    }, 10000)
  } else {
    console.log('🎉 No completion message to show')
  }
}

// Load current live message
const loadCurrentLiveMessage = async () => {
  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${route.params.id}/messages/live`)
    
    if (response.success && response.data.message) {
      currentLiveMessage.value = response.data.message
    }
  } catch (error) {
    console.error('Error loading live message:', error)
  }
}

const createTimer = async () => {
  if (!isAuthenticated.value) {
    console.log('Timer creation requires authentication')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/rooms/${route.params.id}/timers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        title: newTimer.value.title,
        description: `Timer created for ${room.value.name}`,
        duration: newTimer.value.duration * 1000 // Convert to milliseconds
      }
    })
    
    if (response.success) {
      // Reset form
      newTimer.value = { title: '', duration: 0 }
      showCustomDuration.value = false
      customMinutes.value = 25
      customSeconds.value = 0
      
      // Refresh timers list
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error creating timer:', error)
  }
}

// Timer control methods
const startTimer = async (timerId) => {
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/timers/${timerId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error starting timer:', error)
  }
}

const pauseTimer = async (timerId) => {
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/timers/${timerId}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error pausing timer:', error)
  }
}

const resumeTimer = async (timerId) => {
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/timers/${timerId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error resuming timer:', error)
  }
}

const resetTimer = async (timerId) => {
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/timers/${timerId}/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.success) {
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error resetting timer:', error)
  }
}

const deleteTimer = async (timerId) => {
  if (!isAuthenticated.value) {
    console.log('Timer control requires authentication')
    return
  }
  
  if (confirm('Are you sure you want to delete this timer?')) {
    try {
      const token = useCookie('auth-token')
      const response = await $fetch(`/api/timers/${timerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.success) {
        await fetchTimers()
      }
    } catch (error) {
      console.error('Error deleting timer:', error)
    }
  }
}

// Timer selection and control methods
const selectTimer = (timerId) => {
  selectedTimerId.value = timerId
}

const getPlayButtonText = () => {
  if (!selectedTimerId.value) return 'Select Timer'
  
  const selectedTimer = timers.value.find(t => t.id === selectedTimerId.value)
  if (!selectedTimer) return 'Select Timer'
  
  if (selectedTimer.isActive) return 'Pause'
  if (selectedTimer.isPaused) return 'Resume'
  return 'Start'
}

const playSelectedTimer = async () => {
  if (!isAuthenticated.value || !selectedTimerId.value) return
  
  const selectedTimer = timers.value.find(t => t.id === selectedTimerId.value)
  if (!selectedTimer) return
  
  try {
    if (selectedTimer.isActive) {
      // Pause the timer
      await pauseTimer(selectedTimerId.value)
    } else if (selectedTimer.isPaused) {
      // Resume the timer
      await resumeTimer(selectedTimerId.value)
    } else {
      // Start the timer
      await startTimer(selectedTimerId.value)
      
      // If sync mode is on, set up auto-advance
      if (synchronizedMode.value) {
        currentPlayingTimerId.value = selectedTimerId.value
        setupSyncMode()
      }
    }
  } catch (error) {
    console.error('Error controlling timer:', error)
  }
}

const stopAllTimers = async () => {
  if (!isAuthenticated.value) return
  
  try {
    // Stop all active timers
    const activeTimers = timers.value.filter(timer => timer.isActive)
    for (const timer of activeTimers) {
      await pauseTimer(timer.id)
    }
    
    // Reset selection and sync state
    selectedTimerId.value = null
    currentPlayingTimerId.value = null
  } catch (error) {
    console.error('Error stopping all timers:', error)
  }
}

// Synchronized mode methods
const toggleSynchronizedMode = () => {
  synchronizedMode.value = !synchronizedMode.value
  
  if (!synchronizedMode.value) {
    // Turn off sync mode - stop auto-advance
    currentPlayingTimerId.value = null
  } else if (selectedTimerId.value) {
    // Turn on sync mode - set up for current selection
    currentPlayingTimerId.value = selectedTimerId.value
  }
}

const setupSyncMode = () => {
  if (!synchronizedMode.value) return
  
  console.log('🔄 Setting up sync mode')
  
  // Clear any existing interval
  if (window.syncInterval) {
    clearInterval(window.syncInterval)
  }
  
  // Watch for timer completion and auto-advance
  const checkForCompletion = () => {
    if (!currentPlayingTimerId.value) return
    
    const currentTimer = timers.value.find(t => t.id === currentPlayingTimerId.value)
    if (!currentTimer || !currentTimer.isActive) {
      console.log('🔄 Timer finished or stopped, advancing to next')
      // Timer finished or stopped, move to next
      advanceToNextTimer()
    }
  }
  
  // Check every second
  const syncInterval = setInterval(checkForCompletion, 1000)
  
  // Store interval for cleanup
  window.syncInterval = syncInterval
  console.log('🔄 Sync mode interval set up')
}

const advanceToNextTimer = () => {
  if (!synchronizedMode.value) return
  
  console.log('🔄 Advancing to next timer in sync mode')
  const currentIndex = timers.value.findIndex(t => t.id === currentPlayingTimerId.value)
  const nextIndex = currentIndex + 1
  
  console.log(`Current index: ${currentIndex}, Next index: ${nextIndex}, Total timers: ${timers.value.length}`)
  
  if (nextIndex < timers.value.length) {
    // Move to next timer
    const nextTimer = timers.value[nextIndex]
    console.log(`🔄 Moving to next timer: ${nextTimer.title}`)
    selectedTimerId.value = nextTimer.id
    currentPlayingTimerId.value = nextTimer.id
    
    // Auto-start the next timer
    startTimer(nextTimer.id)
  } else {
    // No more timers, sync sequence complete
    console.log('🏁 Sync sequence complete - no more timers')
    selectedTimerId.value = null
    currentPlayingTimerId.value = null
    
    // Clear sync interval
    if (window.syncInterval) {
      clearInterval(window.syncInterval)
      window.syncInterval = null
    }
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
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.id)
        if (timerIndex !== -1) {
          const remainingTime = Math.max(0, Math.floor((new Date(data.endTimestamp).getTime() - new Date().getTime()) / 1000))
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            remainingTime,
            isActive: data.isActive,
            isPaused: !data.isActive && data.duration > 0
          }
          console.log('Updated timer from socket:', timers.value[timerIndex])
        }
      }
    })
    
    // Handle timer creation
    socket.value.on('timer-created', (data) => {
      console.log('Timer created:', data)
      if (data.roomId === route.params.id) {
        // Refresh timers list to include the new timer
        fetchTimers()
      }
    })
    
    // Handle timer completion
    socket.value.on('timer-finished', (data) => {
      console.log('Timer finished:', data)
      console.log('Timer finished data details:', {
        timerId: data.timerId,
        title: data.title,
        roomId: data.roomId,
        completionMessage: data.completionMessage,
        completionMessageType: typeof data.completionMessage,
        completionMessageExists: !!data.completionMessage
      })
      
      if (data.roomId === route.params.id) {
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.timerId)
        if (timerIndex !== -1) {
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            isActive: false,
            isPaused: false,
            remainingTime: 0
          }
          
          // Show completion message if it exists
          if (data.completionMessage) {
            console.log('🎉 Showing completion message from timer-finished event:', data.completionMessage)
            showTimerCompletionMessage({
              completionMessage: data.completionMessage
            })
          } else if (timers.value[timerIndex].completionMessage) {
            console.log('🎉 Showing completion message from timer data:', timers.value[timerIndex].completionMessage)
            showTimerCompletionMessage({
              completionMessage: timers.value[timerIndex].completionMessage
            })
          } else {
            console.log('🎉 No completion message found in event data or timer data')
          }
        }
      }
    })
    
    // Handle real-time timer control events
    socket.value.on('timer-started', (data) => {
      console.log('🔴 Timer started via socket:', data)
      if (data.roomId === route.params.id) {
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.id)
        if (timerIndex !== -1) {
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            isActive: data.isActive,
            isPaused: false,
            remainingTime: data.remainingTime
          }
          console.log('✅ Timer started event matches room, updating timer state')
        }
      }
    })
    
    socket.value.on('timer-paused', (data) => {
      console.log('Timer paused via socket:', data)
      if (data.roomId === route.params.id) {
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.id)
        if (timerIndex !== -1) {
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            isActive: data.isActive,
            isPaused: data.isPaused,
            remainingTime: data.remainingTime
          }
        }
      }
    })
    
    socket.value.on('timer-stopped', (data) => {
      console.log('Timer stopped via socket:', data)
      if (data.roomId === route.params.id) {
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.id)
        if (timerIndex !== -1) {
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            isActive: false,
            isPaused: false,
            remainingTime: 0
          }
        }
      }
    })
    
    // Handle complete room state sync
    socket.value.on('room-state', (data) => {
      console.log('Received room-state:', data)
      if (data.id === route.params.id) {
        room.value = data
        
        // Handle the correct data structure: data.timers or data.room.timers
        const fetchedTimers = data.timers || data.room?.timers || []
        
        if (fetchedTimers.length > 0) {
          // Process each timer to calculate remaining time
          const processedTimers = fetchedTimers.map(timer => {
            let remainingTime = 0
            
            if (timer.isActive) {
              // Timer is running - calculate remaining time from endTimestamp
              const now = new Date().getTime()
              const endTime = new Date(timer.endTimestamp).getTime()
              remainingTime = Math.max(0, Math.floor((endTime - now) / 1000))
            } else {
              // Timer is not active - use duration field (convert from milliseconds to seconds)
              remainingTime = Math.floor(timer.duration / 1000)
            }
            
            return {
              id: timer.id,
              title: timer.title,
              description: timer.description,
              remainingTime: remainingTime,
              isActive: timer.isActive,
              isPaused: !timer.isActive && remainingTime > 0,
              duration: timer.duration,
              endTimestamp: timer.endTimestamp,
              order: timer.order || 0
            }
          })
          
          // Sort by order
          processedTimers.sort((a, b) => a.order - b.order)
          timers.value = processedTimers
          console.log('Synced timers from room-state:', timers.value)
        } else {
          // No timers in room
          timers.value = []
        }
      }
    })
    
    // Handle synchronized timer events
    socket.value.on('all-timers-started', (data) => {
      console.log('All timers started:', data)
      if (data.roomId === route.params.id) {
        // Refresh timers to get updated state
        fetchTimers()
      }
    })
    
    socket.value.on('all-timers-paused', (data) => {
      console.log('All timers paused:', data)
      if (data.roomId === route.params.id) {
        // Refresh timers to get updated state
        fetchTimers()
      }
    })
    
    socket.value.on('timers-reordered', (data) => {
      console.log('Timers reordered:', data)
      if (data.roomId === route.params.id) {
        // Refresh timers to get updated order
        fetchTimers()
      }
    })
    
    // Handle live message updates
    socket.value.on('live-message-updated', (data) => {
      console.log('Live message updated:', data)
      if (data.roomId === route.params.id) {
        currentLiveMessage.value = data.message || ''
      }
    })
    
    // Handle timer completion messages
    socket.value.on('timer-completion-message', (data) => {
      console.log('Timer completion message:', data)
      if (data.roomId === route.params.id) {
        showTimerCompletionMessage(data)
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

// Timer countdown effect for multiple timers
let countdownIntervals = new Map()

const startCountdown = (timerId) => {
  if (countdownIntervals.has(timerId)) {
    clearInterval(countdownIntervals.get(timerId))
  }
  
  const interval = setInterval(() => {
    const timerIndex = timers.value.findIndex(t => t.id === timerId)
    if (timerIndex !== -1) {
      const timer = timers.value[timerIndex]
      if (timer.isActive && timer.remainingTime > 0) {
        timers.value[timerIndex].remainingTime--
      } else if (timer.remainingTime <= 0) {
        timers.value[timerIndex].isActive = false
        timers.value[timerIndex].isPaused = false
        clearInterval(countdownIntervals.get(timerId))
        countdownIntervals.delete(timerId)
      }
    }
  }, 1000)
  
  countdownIntervals.set(timerId, interval)
}

const stopCountdown = (timerId) => {
  if (countdownIntervals.has(timerId)) {
    clearInterval(countdownIntervals.get(timerId))
    countdownIntervals.delete(timerId)
  }
}

// Watch for timer state changes
watch(() => timers.value, (newTimers) => {
  newTimers.forEach(timer => {
    if (timer.isActive && !countdownIntervals.has(timer.id)) {
      startCountdown(timer.id)
    } else if (!timer.isActive && countdownIntervals.has(timer.id)) {
      stopCountdown(timer.id)
    }
  })
}, { deep: true })

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
    fetchTimers(),
    loadCurrentLiveMessage()
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
  // Clear all countdown intervals
  countdownIntervals.forEach((interval) => {
    clearInterval(interval)
  })
  countdownIntervals.clear()
  
  // Clear sync interval
  if (window.syncInterval) {
    clearInterval(window.syncInterval)
    window.syncInterval = null
  }
  
  leaveRoomSocket(route.params.id)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})


// SEO
useHead({
  title: computed(() => room.value ? `${room.value.name} - Live Timer` : 'Room - Live Timer')
})
</script>
