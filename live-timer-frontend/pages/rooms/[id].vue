<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Modern Header -->
    <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/rooms" class="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Rooms
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ room?.name }}
              </h1>
              <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">{{ room?.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
          <button 
            @click="shareRoom"
              class="btn-secondary flex items-center"
          >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Share
          </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Timer Creation & Live Viewers -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Live Preview Section -->
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <!-- Header -->
            <div class="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-t-2xl border-b border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Live Preview
                </h3>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400">LIVE</span>
                </div>
              </div>
            </div>
            
            <!-- Preview Content - Matches shareable link display -->
            <div class="p-4">
              <div class="bg-black rounded-lg relative overflow-hidden aspect-[16/9]">
                <!-- Logo - Top Left (like shareable link) -->
                <div class="absolute top-3 left-3 z-10">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span class="text-white font-bold text-xs">LT</span>
                    </div>
                    <span class="ml-2 text-sm font-semibold text-white">
                      Live Timer
                    </span>
                  </div>
                </div>

                <!-- Timer Name - Top Center (if enabled and timer exists) -->
                <div v-if="showTimerName && displayTimer?.title" class="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <h1 class="text-sm font-bold text-center" :class="displayTimer.isActive ? 'text-blue-400' : 'text-gray-400'">
                    {{ displayTimer.title }}
                  </h1>
                </div>

                <!-- Main Timer Display - Center (matches shareable link) -->
                <div v-if="displayTimer" class="flex flex-col items-center justify-center h-full">
                  <!-- Large Countdown Timer -->
                  <div 
                    class="font-mono font-bold text-center transition-all duration-500"
                    :class="[
                      displayTimer.isActive 
                        ? (currentLiveMessage ? 'text-4xl' : 'text-5xl')
                        : (currentLiveMessage ? 'text-3xl' : 'text-4xl'),
                      displayTimer.isActive ? 'text-white' : 'text-gray-500'
                    ]"
                    :style="{ 
                      fontSize: displayTimer.isActive 
                        ? (currentLiveMessage ? '3rem' : '4rem')
                        : (currentLiveMessage ? '2.5rem' : '3rem'),
                      lineHeight: '1',
                      textShadow: displayTimer.isActive ? '0 0 20px rgba(255, 255, 255, 0.4)' : '0 0 10px rgba(255, 255, 255, 0.2)'
                    }"
                  >
                    {{ formatTime(displayTimer.remainingTime) }}
                  </div>

                  <!-- Completion Message Display (when timer reaches 0) -->
                  <div 
                    v-if="displayTimer.remainingTime === 0 && displayTimer.completionMessage" 
                    class="mt-4 text-center animate-fadeIn"
                  >
                    <div class="text-yellow-400 font-semibold text-xs md:text-sm">
                      {{ displayTimer.completionMessage }}
                    </div>
                  </div>

                  <!-- Live Message Display (if exists) -->
                  <div 
                    v-if="currentLiveMessage && displayTimer.remainingTime > 0" 
                    class="mt-4 text-center"
                  >
                    <div class="text-green-400 font-semibold text-xs md:text-sm">
                      {{ currentLiveMessage }}
                    </div>
                  </div>

                  <!-- Timer Status Indicator -->
                  <div v-if="displayTimer.isActive" class="mt-3 flex items-center justify-center">
                    <div class="flex items-center text-green-400">
                      <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span class="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                  <div v-else-if="displayTimer.remainingTime > 0" class="mt-3 flex items-center justify-center">
                    <div class="flex items-center text-gray-500">
                      <div class="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                      <span class="text-xs font-medium">READY</span>
                    </div>
                  </div>
                </div>

                <!-- No Timer State -->
                <div v-else class="flex flex-col items-center justify-center h-full">
                  <div class="text-center">
                    <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h2 class="text-lg font-bold text-gray-300 mb-2">No Active Timer</h2>
                    <p class="text-sm text-gray-400">Waiting for timer to start...</p>
                  </div>
                </div>
                
                <!-- Overlay with connection info -->
                <div class="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span class="text-white text-xs">{{ liveViewerCount }} viewers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Create Timer Section -->
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <!-- Header -->
            <div class="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-t-2xl border-b border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create Timer</h3>
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
          
          <!-- Timer Creation Form - Only for authenticated users -->
          <div v-if="isAuthenticated">
                <!-- Timer Name Input -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <span class="mr-2">Timer Name</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
              </label>
              <input
                v-model="newTimer.title"
                type="text"
                    class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                placeholder="Enter timer name"
              />
            </div>

                <!-- Completion Message Input -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <span class="mr-2">Completion Message</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </label>
                  <textarea
                    v-model="newTimer.completionMessage"
                    rows="2"
                    class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none"
                    placeholder="Optional: Message to display when timer reaches 0"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This message will be displayed when the timer completes</p>
                </div>

                <!-- Duration Input - Image Style -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <span class="mr-2">Duration</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
              </label>
                  
                  <!-- HH:MM:SS Input -->
                  <div class="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    <input
                      v-model.number="durationHours"
                      type="number"
                      min="0"
                      max="23"
                      class="w-12 text-center text-sm font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                      placeholder="00"
                    />
                    <span class="text-gray-400 font-mono">:</span>
                    <input
                      v-model.number="durationMinutes"
                      type="number"
                      min="0"
                      max="59"
                      class="w-12 text-center text-sm font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                      placeholder="00"
                    />
                    <span class="text-gray-400 font-mono">:</span>
                    <input
                      v-model.number="durationSeconds"
                      type="number"
                      min="0"
                      max="59"
                      class="w-12 text-center text-sm font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                      placeholder="00"
                    />
                </div>
                
                  <!-- Quick Preset Buttons -->
                  <div class="flex flex-wrap gap-2 mt-3">
                  <button 
                      @click="setPresetDuration(5)"
                      class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    >
                      5m
                  </button>
                  <button 
                      @click="setPresetDuration(10)"
                      class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                      10m
                  </button>
                  <button 
                      @click="setPresetDuration(25)"
                      class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    >
                      25m
                    </button>
                    <button 
                      @click="setPresetDuration(60)"
                      class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    >
                      1h
                  </button>
              </div>
            </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-4">
                  <button 
                    @click="resetTimerForm"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
            <button 
              @click="createTimer"
                    :disabled="!newTimer.title || !getTotalDuration()"
                    class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                    Save
            </button>
                </div>
          </div>
          
          <!-- Public viewer message -->
              <div v-else class="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              You're viewing this room as a guest. 
                  <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800 underline font-medium">
                Sign in
              </NuxtLink> 
              to create timers.
            </p>
          </div>
        </div>
      </div>

          <!-- Live Viewers Section -->
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Live Viewers</h3>
            </div>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ liveViewerCount }} online</span>
              </div>
            </div>
            
            <div v-if="liveViewerCount === 0" class="text-center py-6">
              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">No viewers yet</p>
            </div>
            
            <div v-else class="space-y-3 max-h-48 overflow-y-auto">
              <div 
                v-for="connection in liveConnections" 
                :key="connection.socketId"
                class="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
              >
                <div class="relative">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-white">
                      {{ connection.user?.name?.charAt(0) || 'G' }}
                    </span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ connection.user?.name || 'Guest User' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ connection.browser }} • {{ connection.os }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
                    Connected {{ formatConnectionTime(connection.connectedAt) }}
                  </p>
                </div>
                <div class="flex items-center text-green-600 dark:text-green-400">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <span class="text-xs font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Timer List & Broadcast -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Timers Section -->
          <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
          <div class="flex items-center justify-between mb-6">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Room Timers</h3>
              </div>
            
            <!-- Master Controls -->
              <div v-if="isAuthenticated && timers.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <!-- Settings Dropdown -->
                <div class="relative">
                  <button 
                    @click="toggleSettingsDropdown"
                    class="flex items-center space-x-2 bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                    <svg 
                      :class="['w-4 h-4 text-gray-500 transition-transform duration-200', settingsDropdownOpen ? 'rotate-180' : '']" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div 
                    v-if="settingsDropdownOpen"
                    class="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div class="p-4">
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Timer Settings
                      </h4>
                      
                      <!-- Show Timer Name Setting -->
                      <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </div>
                          <div>
                            <h5 class="text-sm font-medium text-gray-900 dark:text-white">Show Timer Names</h5>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Display timer titles in public view</p>
                          </div>
                        </div>
                        <button 
                          @click="toggleShowTimerName"
                          :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 shadow-inner', 
                            showTimerName ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-300 dark:bg-gray-600']"
                        >
                          <span 
                            :class="['inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200',
                            showTimerName ? 'translate-x-6' : 'translate-x-1']"
                          ></span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

              <!-- Master Play/Stop Controls (Music Player Style) -->
                <div class="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <!-- Play/Pause Button -->
                  <button 
                    @click="playSelectedTimer"
                    :disabled="!selectedTimerId"
                      :class="['flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg',
                      getPlayButtonClass()
                    ]"
                  >
                      <svg v-if="getPlayButtonIcon() === 'play'" class="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                      <svg v-else-if="getPlayButtonIcon() === 'pause'" class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                      <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>

                  <!-- Stop Button -->
                  <button 
                    @click="stopAllTimers"
                      class="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors duration-200 shadow-lg"
                  >
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </button>
                </div>
            </div>
          </div>

          <!-- Timer List -->
            <div v-if="timers.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No timers created yet</h3>
              <p class="text-gray-600 dark:text-gray-400">Create your first timer using the panel on the left</p>
          </div>

            <!-- Scrollable Timer List with Drag and Drop -->
            <div v-else class="max-h-96 overflow-y-auto space-y-3 pr-2">
            <div 
              v-for="(timer, index) in timers" 
              :key="timer.id"
              @click="selectTimer(timer.id)"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
                :class="['group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                selectedTimerId === timer.id 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md',
                dragOverIndex === index ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
              ]"
            >
              <div class="flex items-start justify-between gap-4">
                <!-- Left: Drag Handle and Selection Indicator -->
                <div class="flex items-center space-x-2 flex-shrink-0 pt-1">
                  <div class="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                  </div>
                  <div :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer',
                    selectedTimerId === timer.id 
                      ? 'border-blue-500 bg-blue-500 shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                  ]" @click.stop="selectTimer(timer.id)">
                    <div v-if="selectedTimerId === timer.id" class="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <!-- Center: Timer Info -->
                <div class="flex-1 min-w-0">
                  <!-- Timer Name -->
                  <div class="mb-2">
                    <h4 class="font-semibold text-gray-900 dark:text-white text-lg truncate">
                      {{ timer.title }}
                    </h4>
                  </div>
                  
                  <!-- Timer Display and Status -->
                  <div class="flex items-center gap-4 mb-3">
                    <div class="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                      {{ formatTime(timer.remainingTime) }}
                    </div>
                    <div class="flex items-center space-x-2">
                      <div v-if="timer.isActive" class="flex items-center text-green-600 dark:text-green-400">
                        <div class="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                        <span class="text-sm font-medium">Running</span>
                      </div>
                      <div v-else-if="timer.isPaused" class="flex items-center text-yellow-600 dark:text-yellow-400">
                        <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-1.5"></div>
                        <span class="text-sm font-medium">Paused</span>
                      </div>
                      <div v-else class="flex items-center text-gray-500 dark:text-gray-400">
                        <div class="w-2.5 h-2.5 bg-gray-400 rounded-full mr-1.5"></div>
                        <span class="text-sm font-medium">Ready</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Completion Message Badge -->
                  <div v-if="timer.completionMessage" class="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mb-2">
                    <svg class="w-3 h-3 text-yellow-600 dark:text-yellow-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span class="text-xs text-yellow-700 dark:text-yellow-300 font-medium truncate max-w-xs">{{ timer.completionMessage }}</span>
                  </div>
                </div>

                <!-- Right: Action Buttons -->
                <div v-if="isAuthenticated" class="flex items-center gap-2 flex-shrink-0">
                  <button 
                    @click.stop="openEditModal(timer)"
                    :disabled="timer.isActive"
                    :class="[
                      'p-2 rounded-lg transition-all duration-200',
                      timer.isActive 
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                    ]"
                    :title="timer.isActive ? 'Cannot edit timer while running' : 'Edit timer'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    @click.stop="deleteTimer(timer.id)"
                    class="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Delete timer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Timer Modal (outside v-for) -->
          <Teleport to="body">
            <div 
              v-if="editingTimerId" 
              class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              @click.self="cancelEditTimerName"
            >
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Edit Timer</h3>
                  <button
                    @click="cancelEditTimerName"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                  <!-- Timer Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timer Name
                    </label>
                    <input
                      v-model="editingTimerName"
                      type="text"
                      class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Enter timer name"
                    />
                  </div>

                  <!-- Duration -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <div class="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                      <input
                        v-model.number="editingTimerHours"
                        type="number"
                        min="0"
                        max="23"
                        class="w-16 text-center text-lg font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        placeholder="00"
                      />
                      <span class="text-gray-400 font-mono text-xl">:</span>
                      <input
                        v-model.number="editingTimerMinutes"
                        type="number"
                        min="0"
                        max="59"
                        class="w-16 text-center text-lg font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        placeholder="00"
                      />
                      <span class="text-gray-400 font-mono text-xl">:</span>
                      <input
                        v-model.number="editingTimerSeconds"
                        type="number"
                        min="0"
                        max="59"
                        class="w-16 text-center text-lg font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                        placeholder="00"
                      />
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Format: HH:MM:SS</p>
                  </div>

                  <!-- Completion Message -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completion Message
                    </label>
                    <textarea
                      v-model="editingTimerCompletionMessage"
                      rows="3"
                      class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                      placeholder="Optional: Message to display when timer reaches 0"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">This message will be displayed when the timer completes</p>
                  </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    @click="cancelEditTimerName"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveTimerEdits(editingTimerId)"
                    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </Teleport>

          <!-- Broadcast Live Message Section -->
          <div v-if="isAuthenticated" class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Live Broadcast</h3>
            </div>

            <div class="flex space-x-3">
              <input
                v-model="liveMessage"
                type="text"
                class="flex-1 px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Type your live message here..."
              />
              <button 
                @click="updateLiveMessage"
                :disabled="!liveMessage.trim()"
                class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
              >
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  Broadcast
                </div>
              </button>
              <button 
                @click="clearLiveMessage"
                class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Live Message Display (for all users) -->
          <div v-if="currentLiveMessage" class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-semibold text-blue-800 dark:text-blue-200">Live Message:</span>
            </div>
            <p class="text-blue-900 dark:text-blue-100 mt-2 text-lg font-medium">{{ currentLiveMessage }}</p>
          </div>
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
const liveViewerCount = ref(0)
const liveConnections = ref([])

// Timer creation form
const newTimer = ref({
  title: '',
  completionMessage: '',
  duration: 0
})
const durationHours = ref(0)
const durationMinutes = ref(0)
const durationSeconds = ref(0)

// Timer selection
const selectedTimerId = ref(null)

// Show timer name in public display
const showTimerName = ref(true)

// Settings dropdown state
const settingsDropdownOpen = ref(false)

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

// Timer editing state
const editingTimerId = ref(null)
const editingTimerField = ref(null) // 'name', 'duration', or 'completion'
const editingTimerName = ref('')
const editingTimerCompletionMessage = ref('')
const editingTimerHours = ref(0)
const editingTimerMinutes = ref(0)
const editingTimerSeconds = ref(0)

// Drag and drop state
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Computed property to determine which timer to display in preview (matches shareable link logic)
const displayTimer = computed(() => {
  if (timers.value.length === 0) return null
  
  // Priority: 1. Selected timer (if exists), 2. Active timer, 3. First timer
  let targetTimer = null
  
  // If there's a selected timer ID, try to find it first
  if (selectedTimerId.value) {
    targetTimer = timers.value.find(t => t.id === selectedTimerId.value)
  }
  
  // If no selected timer or selected timer not found, find active timer
  if (!targetTimer) {
    targetTimer = timers.value.find(t => t.isActive)
  }
  
  // If still no timer, use the first one
  if (!targetTimer) {
    targetTimer = timers.value[0]
  }
  
  return targetTimer
})

const formatConnectionTime = (connectedAt) => {
  const now = new Date()
  const connected = new Date(connectedAt)
  const diffMs = now - connected
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const fetchRoom = async () => {
  try {
    const response = await $fetch(`/api/rooms/${route.params.id}`)
    console.log('Room response:', response)
  
    room.value = response.data.room
    members.value = response.data.members || []
    
    // Load room settings
    showTimerName.value = room.value?.showTimerName ?? true
    
    // Debug: Log the share token
    console.log('Room shareToken:', room.value?.shareToken)
    console.log('Room ID:', room.value?.id)
    console.log('Show Timer Name:', showTimerName.value)
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
        completionMessage: timer.completionMessage || null,
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
  durationHours.value = 0
  durationMinutes.value = minutes
  durationSeconds.value = 0
  updateTimerDuration()
}

const getTotalDuration = () => {
  return (durationHours.value * 3600) + (durationMinutes.value * 60) + durationSeconds.value
}

const updateTimerDuration = () => {
  newTimer.value.duration = getTotalDuration()
}

const resetTimerForm = () => {
  newTimer.value.title = ''
  newTimer.value.completionMessage = ''
  newTimer.value.duration = 0
  durationHours.value = 0
  durationMinutes.value = 0
  durationSeconds.value = 0
}

// Watch for changes in duration inputs
watch([durationHours, durationMinutes, durationSeconds], () => {
  updateTimerDuration()
}, { deep: true })

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
    return 'bg-yellow-500 hover:bg-yellow-600 text-white'
  }
  return 'bg-green-500 hover:bg-green-600 text-white'
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

const loadConnectionStats = async () => {
  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${route.params.id}/connections`)
    
    if (response?.success && response?.data) {
      liveViewerCount.value = response.data.connectedUsers || 0
      liveConnections.value = response.data.connections || []
      console.log('Initial connection stats loaded:', response.data)
    } else {
      console.warn('Invalid response format for connection stats:', response)
      liveViewerCount.value = 0
      liveConnections.value = []
    }
  } catch (error) {
    console.error('Error loading connection stats:', error)
    // Set default values if API fails - graceful degradation
    liveViewerCount.value = 0
    liveConnections.value = []
    
    // Show user-friendly error message in development
    if (process.dev) {
      console.warn('Connection stats unavailable - using fallback values')
    }
  }
}

const createTimer = async () => {
  if (!isAuthenticated.value) {
    console.log('Timer creation requires authentication')
    return
  }
  
  // Validate form data before sending
  if (!newTimer.value.title || !newTimer.value.title.trim()) {
    console.error('Timer title is required')
    return
  }
  
  if (!newTimer.value.duration || newTimer.value.duration <= 0) {
    console.error('Timer duration must be greater than 0')
    return
  }
  
  const durationMs = newTimer.value.duration * 1000
  if (durationMs < 1000 || durationMs > 86400000) {
    console.error('Timer duration must be between 1 second and 24 hours')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const requestBody = {
      title: newTimer.value.title.trim(),
      description: `Timer created for ${room.value.name}`,
      completionMessage: newTimer.value.completionMessage?.trim() || undefined,
      duration: durationMs
    }
    
    console.log('Creating timer with data:', requestBody)
    
    const response = await $fetch(`/api/rooms/${route.params.id}/timers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: requestBody
    })
    
    if (response.success) {
      // Reset form
      resetTimerForm()
      
      // Refresh timers list
      await fetchTimers()
    }
  } catch (error) {
    console.error('Error creating timer:', error)
    console.error('Error details:', error.data || error.message)
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
  
  // Broadcast timer selection to all room viewers via socket
  if (socket.value && socket.value.connected && room.value?.id) {
    socket.value.emit('timer-selected', {
      roomId: room.value.id,
      timerId: timerId
    })
    console.log('Broadcasted timer selection:', timerId)
  }
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
    
    // Reset selection
    selectedTimerId.value = null
  } catch (error) {
    console.error('Error stopping all timers:', error)
  }
}

// Settings dropdown toggle method
const toggleSettingsDropdown = () => {
  settingsDropdownOpen.value = !settingsDropdownOpen.value
}

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event) => {
  if (settingsDropdownOpen.value && !event.target.closest('.relative')) {
    settingsDropdownOpen.value = false
  }
}

// Show timer name toggle method
const toggleShowTimerName = async () => {
  showTimerName.value = !showTimerName.value
  
  // Save the setting to the room
  try {
    const token = useCookie('auth-token')
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase || ''
    
    // Use full API URL to prevent Vue Router from intercepting it
    const apiUrl = `${apiBase}/api/rooms/${route.params.id}`
    
    const response = await $fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        showTimerName: showTimerName.value
      },
      // Prevent Nuxt from treating this as a navigation
      retry: 0,
      // Don't throw on error, handle it manually
      onRequestError({ error }) {
        console.error('Request error updating show timer name:', error)
      },
      onResponseError({ response }) {
        console.error('Response error updating show timer name:', response.status, response._data)
      }
    })
    
    if (response.success) {
      // Server already broadcasts the setting change via socketService.emitToRoom
      // No need to emit from client side
      console.log('Show timer name setting updated successfully:', showTimerName.value)
    }
  } catch (error) {
    console.error('Error updating show timer name setting:', error)
    // Revert the change if it failed
    showTimerName.value = !showTimerName.value
  }
}



const shareRoom = () => {
  const shareUrl = `${window.location.origin}/room/${room.value.shareToken}`
  console.log('Share URL:', shareUrl)
  console.log('Share Token:', room.value.shareToken)
  navigator.clipboard.writeText(shareUrl)
  alert(`Room shared! URL copied to clipboard: ${shareUrl}`)
}

// Timer editing methods
const openEditModal = (timer) => {
  if (!isAuthenticated.value || timer.isActive) return
  
  editingTimerId.value = timer.id
  editingTimerField.value = 'all'
  editingTimerName.value = timer.title || ''
  editingTimerCompletionMessage.value = timer.completionMessage || ''
  
  // Convert milliseconds to hours, minutes, seconds
  const durationMs = timer.duration || 0
  const totalSeconds = Math.floor(durationMs / 1000)
  editingTimerHours.value = Math.floor(totalSeconds / 3600)
  editingTimerMinutes.value = Math.floor((totalSeconds % 3600) / 60)
  editingTimerSeconds.value = totalSeconds % 60
}

const saveTimerEdits = async (timerId) => {
  if (!isAuthenticated.value) {
    cancelEditTimerName()
    return
  }
  
  // Validate inputs
  if (!editingTimerName.value.trim()) {
    alert('Timer name is required')
    return
  }
  
  const totalSeconds = (editingTimerHours.value * 3600) + (editingTimerMinutes.value * 60) + editingTimerSeconds.value
  if (totalSeconds <= 0) {
    alert('Duration must be greater than 0')
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const updateBody = {
      title: editingTimerName.value.trim(),
      duration: totalSeconds * 1000, // Convert to milliseconds
      completionMessage: editingTimerCompletionMessage.value.trim() || undefined
    }
    
    const response = await $fetch(`/api/timers/${timerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: updateBody
    })
    
    if (response.success) {
      // Refresh timers to get updated state from server
      await fetchTimers()
      cancelEditTimerName()
    }
  } catch (error) {
    console.error('Error updating timer:', error)
    if (error.data?.message) {
      alert(`Error: ${error.data.message}`)
    } else {
      alert('Failed to update timer. Please try again.')
    }
  }
}

const cancelEditTimerName = () => {
  editingTimerId.value = null
  editingTimerField.value = null
  editingTimerName.value = ''
  editingTimerCompletionMessage.value = ''
  editingTimerHours.value = 0
  editingTimerMinutes.value = 0
  editingTimerSeconds.value = 0
}

// Drag and drop methods
const handleDragStart = (event, index) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.outerHTML)
  event.target.style.opacity = '0.5'
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

const handleDrop = async (event, dropIndex) => {
  event.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    return
  }
  
  try {
    // Reorder timers array
    const newTimers = [...timers.value]
    const draggedTimer = newTimers[draggedIndex.value]
    
    // Remove dragged timer from its current position
    newTimers.splice(draggedIndex.value, 1)
    
    // Insert at new position
    newTimers.splice(dropIndex, 0, draggedTimer)
    
    // Update local state immediately for better UX
    timers.value = newTimers
    
    // Update order values and send to server
    const timerIds = newTimers.map(timer => timer.id)
    await reorderTimers(timerIds)
    
  } catch (error) {
    console.error('Error reordering timers:', error)
    // Revert on error
    await fetchTimers()
  }
}

const handleDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggedIndex.value = null
  dragOverIndex.value = null
}

const reorderTimers = async (timerIds) => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await $fetch(`/api/rooms/${route.params.id}/timers/reorder`, {
      method: 'POST',
      body: { timerIds }
    })
    
    if (response.success) {
      // Broadcast the reorder to all connected users
      if (socket.value) {
        socket.value.emit('timers-reordered', {
          roomId: route.params.id,
          timerIds
        })
      }
    }
  } catch (error) {
    console.error('Error reordering timers:', error)
    throw error
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
            isPaused: !data.isActive && data.duration > 0,
            completionMessage: data.completionMessage !== undefined ? data.completionMessage : timers.value[timerIndex].completionMessage
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
      
      if (data.roomId === route.params.id) {
        // Update the specific timer in the timers array
        const timerIndex = timers.value.findIndex(t => t.id === data.timerId)
        if (timerIndex !== -1) {
          timers.value[timerIndex] = {
            ...timers.value[timerIndex],
            isActive: false,
            isPaused: false,
            remainingTime: 0,
            completionMessage: data.completionMessage || timers.value[timerIndex].completionMessage
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
              completionMessage: timer.completionMessage || null,
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
    
    // Handle room setting changes
    socket.value.on('room-setting-changed', (data) => {
      console.log('Room setting changed:', data)
      if (data.roomId === route.params.id) {
        if (data.setting === 'showTimerName') {
          showTimerName.value = data.value
        }
      }
    })
    
    
    // Handle user count updates (simple count only - use as fallback)
    socket.value.on('user-count', (count) => {
      console.log('User count updated (simple):', count)
      // Only update if we don't have more detailed info
      if (liveViewerCount.value === 0 || count !== liveViewerCount.value) {
        liveViewerCount.value = count
      }
    })
    
    // Handle detailed user count updates with connection info - PRIMARY SOURCE OF TRUTH
    socket.value.on('user-count-update', (data) => {
      try {
        console.log('User count update with details:', data)
        
        // Use both room ID and share token for comparison
        const isRoomMatch = data?.roomId === route.params.id || 
                           data?.roomId === room.value?.id ||
                           String(data?.roomId) === String(route.params.id) ||
                           String(data?.roomId) === String(room.value?.id)
        
        if (isRoomMatch) {
          // Always use user-count-update as the source of truth
          // This ensures we have accurate counts that exclude admin
          liveViewerCount.value = data.count ?? 0
          liveConnections.value = data.connections ?? []
          console.log('✅ Updated live viewer count:', liveViewerCount.value, 'connections:', liveConnections.value.length)
        } else {
          console.log('❌ Room ID mismatch, ignoring event')
        }
      } catch (error) {
        console.error('Error handling user-count-update:', error)
      }
    })
    
    // Handle user joined events (viewers only - admin events are filtered on server)
    socket.value.on('user-joined', (data) => {
      try {
        console.log('User joined (viewer):', data)
        
        // Use both room ID and share token for comparison
        const isRoomMatch = data?.roomId === route.params.id || 
                           data?.roomId === room.value?.id ||
                           String(data?.roomId) === String(route.params.id) ||
                           String(data?.roomId) === String(room.value?.id)
        
        if (isRoomMatch && data?.connection) {
          // Update count from event
          liveViewerCount.value = data.totalUsers ?? 0
          
          // Add connection only if not already present (safety check)
          const existingIndex = liveConnections.value.findIndex(c => c.socketId === data.connection.socketId)
          if (existingIndex === -1) {
            liveConnections.value.push(data.connection)
            console.log('✅ Added new viewer connection:', data.connection.browser, 'on', data.connection.os)
          }
        }
      } catch (error) {
        console.error('Error handling user-joined:', error)
      }
    })
    
    // Handle user left events (viewers only - admin events are filtered on server)
    socket.value.on('user-left', (data) => {
      try {
        console.log('User left (viewer):', data)
        
        // Use both room ID and share token for comparison
        const isRoomMatch = data?.roomId === route.params.id || 
                           data?.roomId === room.value?.id ||
                           String(data?.roomId) === String(route.params.id) ||
                           String(data?.roomId) === String(room.value?.id)
        
        if (isRoomMatch) {
          // Update count from event
          liveViewerCount.value = data.totalUsers ?? 0
          
          // Remove connection from the list
          const beforeCount = liveConnections.value.length
          liveConnections.value = liveConnections.value.filter(c => c.socketId !== data.socketId)
          const afterCount = liveConnections.value.length
          console.log('✅ Removed viewer connection, count changed from', beforeCount, 'to', afterCount)
        }
      } catch (error) {
        console.error('Error handling user-left:', error)
      }
    })
    
    // Handle test events to verify connection
    socket.value.on('test-event', (data) => {
      console.log('Test event received:', data)
      console.log('Current route.params.id:', route.params.id)
      console.log('Data roomId:', data.roomId)
      console.log('Room ID match:', data.roomId === route.params.id)
      if (data.roomId === route.params.id) {
        console.log('✅ Socket connection verified for room:', data.roomId)
      } else {
        console.log('❌ Socket test event room ID mismatch')
      }
    })
    
    // Handle socket errors
    socket.value.on('error', (error) => {
      console.error('Socket error:', error)
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
  
  // Add click outside listener for dropdown
  document.addEventListener('click', closeDropdownOnClickOutside)
  
  // First, fetch room and timer data
  await Promise.all([
    fetchRoom(),
    fetchTimers(),
    loadCurrentLiveMessage(),
    loadConnectionStats()
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
  
  // Set up periodic connection stats refresh as fallback
  const connectionStatsInterval = setInterval(() => {
    console.log('🔄 Refreshing connection stats...')
    loadConnectionStats()
  }, 10000) // Refresh every 10 seconds
  
  // Store intervals for cleanup
  onUnmounted(() => {
    clearInterval(syncInterval)
    clearInterval(connectionStatsInterval)
  })
})

// Cleanup
onUnmounted(() => {
  // Clear all countdown intervals
  countdownIntervals.forEach((interval) => {
    clearInterval(interval)
  })
  countdownIntervals.clear()
  
  
  leaveRoomSocket(route.params.id)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.removeEventListener('click', closeDropdownOnClickOutside)
})


// SEO
useHead({
  title: computed(() => room.value ? `${room.value.name} - Live Timer` : 'Room - Live Timer')
})
</script>
