<template>
  <div v-if="showWarning" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          {{ warningTitle }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <p>{{ warningMessage }}</p>
        </div>
        <div class="mt-3">
          <div class="flex space-x-3">
            <NuxtLink
              v-if="!subscription"
              to="/pricing"
              class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors">
              Upgrade Plan
            </NuxtLink>
            <button
              v-else
              @click="openCustomerPortal"
              class="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ["rooms", "timers", "views"].includes(value),
  },
  current: {
    type: Number,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  subscription: {
    type: Object,
    default: null,
  },
});

const { createCustomerPortal } = useStripe();

// Calculate warning threshold (80% of limit)
const warningThreshold = computed(() => Math.floor(props.limit * 0.8));

// Show warning if approaching limit
const showWarning = computed(() => {
  return props.current >= warningThreshold.value && props.current < props.limit;
});

// Warning messages
const warningMessages = {
  rooms: {
    title: "Room limit almost reached",
    message: `You're using ${props.current} of ${props.limit} rooms. Consider upgrading to create more rooms.`,
  },
  timers: {
    title: "Timer limit almost reached",
    message: `You're using ${props.current} of ${props.limit} timers in this room. Consider upgrading for more timers.`,
  },
  views: {
    title: "View limit almost reached",
    message: `You've used ${props.current} of ${props.limit} views this month. Consider upgrading for unlimited views.`,
  },
};

const warningTitle = computed(() => warningMessages[props.type].title);
const warningMessage = computed(() => warningMessages[props.type].message);

const openCustomerPortal = async () => {
  try {
    await createCustomerPortal();
  } catch (error) {
    console.error("Error opening customer portal:", error);
  }
};
</script>
