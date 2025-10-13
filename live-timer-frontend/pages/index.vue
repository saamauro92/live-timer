<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Live Timer
            <span class="text-blue-600">SaaS</span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Real-time collaborative timers for teams. Create rooms, start timers, and work together seamlessly.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/register" class="btn-primary text-lg px-8 py-3"> Get Started Free </NuxtLink>
            <NuxtLink to="/login" class="btn-secondary text-lg px-8 py-3"> Sign In </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">Create and share live timers in just 3 simple steps</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <!-- Step 1 -->
          <div class="relative">
            <div class="card p-8 text-center relative">
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Set the Time</h3>
              <p class="text-gray-600 dark:text-gray-300">Create a room and add timers with custom durations. Perfect for meetings, presentations, or any timed activity.</p>
            </div>
            <!-- Arrow -->
            <div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="relative">
            <div class="card p-8 text-center relative">
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Share the Link</h3>
              <p class="text-gray-600 dark:text-gray-300">Get a unique share link for your room. Anyone with the link can view the live timer display on any device.</p>
            </div>
            <!-- Arrow -->
            <div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <!-- Step 3 -->
          <div>
            <div class="card p-8 text-center relative">
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Click Play!</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Start your timer and watch it sync in real-time across all connected devices. Perfect for presentations, meetings, and events.
              </p>
            </div>
          </div>
        </div>

        <!-- Demo Preview -->
        <div class="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">See It In Action</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Watch how your timer appears to viewers in real-time</p>
          <div class="bg-black rounded-xl p-6 max-w-md mx-auto">
            <div class="text-center">
              <div class="text-6xl font-mono font-bold text-green-400 mb-2">05:00</div>
              <div class="flex items-center justify-center text-green-400">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span class="text-sm">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need for team timing</h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">Powerful features designed for modern teams</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="card p-8 text-center">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Timers</h3>
            <p class="text-gray-600 dark:text-gray-300">Start, pause, and stop timers that sync across all team members in real-time.</p>
          </div>

          <div class="card p-8 text-center">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Team Rooms</h3>
            <p class="text-gray-600 dark:text-gray-300">Create private rooms for your team and invite members to collaborate on timers.</p>
          </div>

          <div class="card p-8 text-center">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Live Broadcasting</h3>
            <p class="text-gray-600 dark:text-gray-300">Send live messages and updates to all viewers in real-time during your presentations.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-blue-600 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
        <p class="text-xl text-blue-100 mb-8">Join thousands of teams already using Live Timer</p>
        <NuxtLink to="/register" class="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors duration-200">
          Start Free Trial
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: "Live Timer - Real-time Collaborative Timers for Teams",
  meta: [{ name: "description", content: "Real-time collaborative timers for teams. Create rooms, start timers, and work together seamlessly." }],
});
</script>
