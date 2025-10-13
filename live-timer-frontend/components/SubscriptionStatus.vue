<template>
  <div class="subscription-status">
    <div v-if="loading" class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span class="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
    </div>

    <div v-else-if="subscription" class="flex items-center space-x-2">
      <span
        :class="{
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': subscription.status === 'active',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': subscription.status === 'trialing',
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': subscription.status === 'past_due',
        }"
        class="px-2 py-1 text-xs font-medium rounded-full">
        {{ subscription.product.name }}
      </span>
      <span v-if="subscription.cancelAtPeriodEnd" class="text-xs text-red-600 dark:text-red-400"> Cancels {{ formatDate(subscription.currentPeriodEnd) }} </span>
    </div>

    <div v-else class="flex items-center space-x-2">
      <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"> Free Plan </span>
      <NuxtLink to="/pricing" class="text-xs text-blue-600 dark:text-blue-400 hover:underline"> Upgrade </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true);
const subscription = ref(null);

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
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays < 7) return `in ${diffDays} days`;

  return date.toLocaleDateString();
};

// Load on mount
onMounted(() => {
  loadSubscription();
});

// Expose refresh method
defineExpose({
  refresh: loadSubscription,
});
</script>
