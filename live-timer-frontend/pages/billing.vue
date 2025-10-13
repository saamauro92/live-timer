<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your subscription and billing information</p>
          </div>
          <NuxtLink to="/dashboard" class="btn-secondary"> Back to Dashboard </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Current Subscription -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Current Subscription</h2>
          </div>
          <div class="p-6">
            <div v-if="subscriptionLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading subscription...</p>
            </div>
            <div v-else-if="subscription" class="space-y-6">
              <!-- Subscription Details -->
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ subscription.product.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ subscription.product.description }}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">${{ (subscription.price.amount / 100).toFixed(2) }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">per {{ subscription.price.interval }}</div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center space-x-4">
                <span
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': subscription.status === 'active',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': subscription.status === 'trialing',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': subscription.status === 'past_due',
                  }"
                  class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) }}
                </span>
                <span v-if="subscription.cancelAtPeriodEnd" class="text-sm text-red-600 dark:text-red-400"> Cancels on {{ formatDate(subscription.currentPeriodEnd) }} </span>
              </div>

              <!-- Billing Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Period</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(subscription.currentPeriodStart) }} - {{ formatDate(subscription.currentPeriodEnd) }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Next Billing Date</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(subscription.currentPeriodEnd) }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <button @click="openCustomerPortal" class="btn-primary">Manage Subscription</button>
                <button
                  v-if="!subscription.cancelAtPeriodEnd"
                  @click="cancelSubscription"
                  class="btn-outline text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900">
                  Cancel Subscription
                </button>
                <button v-else @click="reactivateSubscription" class="btn-primary">Reactivate Subscription</button>
                <NuxtLink to="/pricing" class="btn-secondary"> Change Plan </NuxtLink>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active subscription</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started with a subscription to unlock premium features.</p>
              <div class="mt-6">
                <NuxtLink to="/pricing" class="btn-primary"> View Plans </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Billing History -->
        <div v-if="subscription" class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Billing History</h2>
          </div>
          <div class="p-6">
            <div class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Billing history</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">View your complete billing history in the customer portal.</p>
              <div class="mt-6">
                <button @click="openCustomerPortal" class="btn-secondary">View Billing History</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Usage & Limits</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ usage.rooms }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Active Rooms</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                  {{ subscription ? "Unlimited" : "3 free rooms" }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ usage.timers }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Active Timers</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                  {{ subscription ? "Unlimited" : "10 per room" }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ usage.views }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Total Views</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">
                  {{ subscription ? "Unlimited" : "100 per month" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Need Help?</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Billing Questions</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Have questions about your subscription or billing? Use the customer portal to manage everything.</p>
                <button @click="openCustomerPortal" class="btn-secondary text-sm">Open Customer Portal</button>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Technical Support</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Need help with features or have technical questions? We're here to help.</p>
                <a href="mailto:support@livetimer.com" class="btn-secondary text-sm"> Contact Support </a>
              </div>
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
const subscriptionLoading = ref(true);
const subscription = ref(null);
const usage = ref({
  rooms: 0,
  timers: 0,
  views: 0,
});

// Load subscription data
const loadSubscriptionData = async () => {
  try {
    // Load subscription
    const subscriptionResponse = await $fetch("/api/stripe/subscription");
    if (subscriptionResponse.success) {
      subscription.value = subscriptionResponse.subscription;
    }

    // Load usage data (mock for now)
    usage.value = {
      rooms: 3,
      timers: 7,
      views: 42,
    };
  } catch (error) {
    console.error("Error loading subscription data:", error);
  } finally {
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
  if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) return;

  try {
    const response = await $fetch("/api/stripe/cancel-subscription", {
      method: "POST",
    });

    if (response.success) {
      // Reload subscription data
      await loadSubscriptionData();
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
      await loadSubscriptionData();
    }
  } catch (error) {
    console.error("Error reactivating subscription:", error);
  }
};

// Utility functions
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Load data on mount
onMounted(() => {
  loadSubscriptionData();
});

// SEO
useHead({
  title: "Billing & Subscription - Live Timer",
});
</script>
