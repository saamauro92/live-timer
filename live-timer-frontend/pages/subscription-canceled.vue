<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Subscription Canceled</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your subscription has been canceled. You'll continue to have access to premium features until the end of your billing period.
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Access until</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(accessUntil) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">After that</span>
            <span class="text-sm text-gray-900 dark:text-white">Free plan limits apply</span>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <button
            @click="reactivateSubscription"
            :disabled="reactivating"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="reactivating" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Reactivating...
            </span>
            <span v-else>Reactivate Subscription</span>
          </button>
          <NuxtLink
            to="/dashboard"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Continue to Dashboard
          </NuxtLink>
        </div>
      </div>

      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">What happens next?</h3>
            <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul class="list-disc list-inside space-y-1">
                <li>You'll keep all premium features until {{ formatDate(accessUntil) }}</li>
                <li>After that, you'll be moved to the free plan</li>
                <li>Your data will be preserved</li>
                <li>You can reactivate anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Questions about your subscription?
          <a href="mailto:support@livetimer.com" class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"> Contact support </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const reactivating = ref(false);
const accessUntil = ref(null);

// Load subscription data to get access until date
const loadSubscription = async () => {
  try {
    const response = await $fetch("/api/stripe/subscription");
    if (response.success && response.subscription) {
      accessUntil.value = response.subscription.currentPeriodEnd;
    }
  } catch (error) {
    console.error("Error loading subscription:", error);
  }
};

// Reactivate subscription
const reactivateSubscription = async () => {
  reactivating.value = true;
  try {
    const response = await $fetch("/api/stripe/reactivate-subscription", {
      method: "POST",
    });

    if (response.success) {
      // Redirect to dashboard with success message
      await navigateTo("/dashboard?reactivated=true");
    }
  } catch (error) {
    console.error("Error reactivating subscription:", error);
  } finally {
    reactivating.value = false;
  }
};

// Utility function
const formatDate = (timestamp) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Load subscription data on mount
onMounted(() => {
  loadSubscription();
});

// SEO
useHead({
  title: "Subscription Canceled - Live Timer",
});
</script>
