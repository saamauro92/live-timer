<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back, {{ user?.name }}!</p>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/rooms" class="btn-primary"> View Rooms </NuxtLink>
            <NuxtLink to="/rooms/new" class="btn-secondary"> Create Room </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success Message -->
      <div v-if="showSuccessMessage" class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">Success!</h3>
            <div class="mt-1 text-sm text-green-700 dark:text-green-300">
              <p>Your subscription has been updated successfully.</p>
            </div>
          </div>
          <div class="ml-auto pl-3">
            <button @click="showSuccessMessage = false" class="text-green-400 hover:text-green-600 dark:hover:text-green-300">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalRooms }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Timers</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.activeTimers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalViews }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Rooms -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Recent Rooms</h2>
            </div>
            <div class="p-6">
              <div v-if="loading" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading rooms...</p>
              </div>
              <div v-else-if="recentRooms.length === 0" class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rooms yet</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first room.</p>
                <div class="mt-6">
                  <NuxtLink to="/rooms/new" class="btn-primary"> Create Room </NuxtLink>
                </div>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="room in recentRooms"
                  :key="room.id"
                  class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ room.name }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Created {{ formatDate(room.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <NuxtLink :to="`/rooms/${room.id}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"> View </NuxtLink>
                    <NuxtLink :to="`/room/${room.shareToken}`" class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium">
                      Share
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Subscription Status -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Subscription</h2>
            </div>
            <div class="p-6">
              <div v-if="subscriptionLoading" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <div v-else-if="subscription" class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ subscription.product.name }}</span>
                  <span
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': subscription.status === 'active',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': subscription.status === 'trialing',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': subscription.status === 'past_due',
                    }"
                    class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ subscription.status }}
                  </span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <p>Next billing: {{ formatDate(subscription.currentPeriodEnd) }}</p>
                  <p v-if="subscription.cancelAtPeriodEnd" class="text-red-600 dark:text-red-400">Cancels at period end</p>
                </div>
                <div class="flex space-x-2">
                  <button @click="openCustomerPortal" class="flex-1 btn-secondary text-sm">Manage</button>
                  <button
                    v-if="!subscription.cancelAtPeriodEnd"
                    @click="cancelSubscription"
                    class="flex-1 btn-outline text-sm text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900">
                    Cancel
                  </button>
                  <button v-else @click="reactivateSubscription" class="flex-1 btn-primary text-sm">Reactivate</button>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No subscription</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Upgrade to unlock premium features.</p>
                <div class="mt-4">
                  <NuxtLink to="/pricing" class="btn-primary text-sm"> View Plans </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div class="p-6 space-y-3">
              <NuxtLink
                to="/rooms/new"
                class="flex items-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create New Room
              </NuxtLink>
              <NuxtLink
                to="/rooms"
                class="flex items-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                View All Rooms
              </NuxtLink>
              <NuxtLink
                to="/pricing"
                class="flex items-center p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Upgrade Plan
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user } = useAuth();

// Redirect if not authenticated
if (!user.value) {
  await navigateTo("/login");
}

// State
const loading = ref(true);
const subscriptionLoading = ref(true);
const recentRooms = ref([]);
const subscription = ref(null);
const stats = ref({
  totalRooms: 0,
  activeTimers: 0,
  totalViews: 0,
});

// Load dashboard data
const loadDashboardData = async () => {
  try {
    // Load recent rooms
    const roomsResponse = await $fetch("/api/rooms/recent");
    if (roomsResponse.success) {
      recentRooms.value = roomsResponse.rooms || [];
      stats.value.totalRooms = roomsResponse.rooms?.length || 0;
    }

    // Load subscription
    const subscriptionResponse = await $fetch("/api/stripe/subscription");
    if (subscriptionResponse.success) {
      subscription.value = subscriptionResponse.subscription;
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    loading.value = false;
    subscriptionLoading.value = false;
  }
};

// Subscription management
const openCustomerPortal = async () => {
  try {
    const { createCustomerPortal } = useStripe();
    await createCustomerPortal();
  } catch (error) {
    console.error("Error opening customer portal:", error);
  }
};

const cancelSubscription = async () => {
  if (!confirm("Are you sure you want to cancel your subscription?")) return;

  try {
    const response = await $fetch("/api/stripe/cancel-subscription", {
      method: "POST",
    });

    if (response.success) {
      // Reload subscription data
      await loadDashboardData();
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
  }
};

const reactivateSubscription = async () => {
  try {
    const response = await $fetch("/api/stripe/reactivate-subscription", {
      method: "POST",
    });

    if (response.success) {
      // Reload subscription data
      await loadDashboardData();
    }
  } catch (error) {
    console.error("Error reactivating subscription:", error);
  }
};

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Check for success messages in URL
const route = useRoute();
const showSuccessMessage = ref(false);

// Load data on mount
onMounted(() => {
  loadDashboardData();

  // Check for success messages
  if (route.query.success === "true") {
    showSuccessMessage.value = true;
    // Remove query parameter from URL
    navigateTo("/dashboard", { replace: true });
  }

  if (route.query.reactivated === "true") {
    showSuccessMessage.value = true;
    // Remove query parameter from URL
    navigateTo("/dashboard", { replace: true });
  }
});

// SEO
useHead({
  title: "Dashboard - Live Timer",
});
</script>
