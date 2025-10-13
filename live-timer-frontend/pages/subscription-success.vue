<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Subscription Successful!</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Welcome to {{ subscription?.product?.name || "your new plan" }}! You now have access to all premium features.</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div v-if="subscription" class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ subscription.product.name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {{ subscription.status }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Next billing</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(subscription.currentPeriodEnd) }}</span>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <NuxtLink
            to="/dashboard"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Go to Dashboard
          </NuxtLink>
          <NuxtLink
            to="/rooms"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Create Your First Room
          </NuxtLink>
        </div>
      </div>

      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Need help getting started?
          <a href="mailto:support@livetimer.com" class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"> Contact our support team </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const subscription = ref(null);
const loading = ref(true);

// Load subscription data
const loadSubscription = async () => {
  try {
    const response = await $fetch("/api/stripe/subscription");
    if (response.success) {
      subscription.value = response.subscription;
    }
  } catch (error) {
    console.error("Error loading subscription:", error);
  } finally {
    loading.value = false;
  }
};

// Utility function
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Load subscription data on mount
onMounted(() => {
  loadSubscription();
});

// SEO
useHead({
  title: "Subscription Successful - Live Timer",
});
</script>
