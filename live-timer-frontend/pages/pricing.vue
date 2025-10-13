<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Choose the plan that's right for your team. Upgrade or downgrade at any time.</p>
    </div>

    <!-- Pricing Toggle -->
    <div class="flex justify-center mb-12">
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          @click="billingPeriod = 'monthly'"
          :class="billingPeriod === 'monthly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          class="px-6 py-2 rounded-md font-medium transition-colors duration-200">
          Monthly
        </button>
        <button
          @click="billingPeriod = 'yearly'"
          :class="billingPeriod === 'yearly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'"
          class="px-6 py-2 rounded-md font-medium transition-colors duration-200">
          Yearly
          <span class="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"> Save 20% </span>
        </button>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- Free Plan -->
      <div class="card p-8">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Perfect for individuals</p>
          <div class="mb-8">
            <span class="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
            <span class="text-gray-600 dark:text-gray-300">/month</span>
          </div>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Up to 3 rooms</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Basic timers</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Real-time sync</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Up to 5 team members</span>
          </li>
        </ul>

        <button @click="selectPlan('free')" class="w-full btn-secondary">Get Started</button>
      </div>

      <!-- Pro Plan -->
      <div class="card p-8 border-2 border-blue-500 relative">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium"> Most Popular </span>
        </div>

        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Perfect for small teams</p>
          <div class="mb-8">
            <span class="text-4xl font-bold text-gray-900 dark:text-white"> ${{ billingPeriod === "yearly" ? "8" : "10" }} </span>
            <span class="text-gray-600 dark:text-gray-300">/month</span>
            <span v-if="billingPeriod === 'yearly'" class="text-sm text-green-600 dark:text-green-400 ml-2"> (billed yearly) </span>
          </div>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Unlimited rooms</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Advanced timers</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Analytics & reports</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Up to 25 team members</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Priority support</span>
          </li>
        </ul>

        <button @click="selectPlan('pro')" class="w-full btn-primary">Start Pro Trial</button>
      </div>

      <!-- Enterprise Plan -->
      <div class="card p-8">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">For large organizations</p>
          <div class="mb-8">
            <span class="text-4xl font-bold text-gray-900 dark:text-white">$25</span>
            <span class="text-gray-600 dark:text-gray-300">/month</span>
          </div>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Everything in Pro</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Unlimited team members</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Custom integrations</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">Dedicated support</span>
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">SSO & advanced security</span>
          </li>
        </ul>

        <button @click="selectPlan('enterprise')" class="w-full btn-secondary">Contact Sales</button>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Frequently Asked Questions</h2>

      <div class="space-y-8">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I change plans at any time?</h3>
          <p class="text-gray-600 dark:text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">What happens to my data if I cancel?</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Your data is safe. You can export your data before canceling, and we'll keep it for 30 days in case you want to reactivate.
          </p>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Do you offer refunds?</h3>
          <p class="text-gray-600 dark:text-gray-300">We offer a 30-day money-back guarantee for all paid plans. No questions asked.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isAuthenticated } = useAuth();
const { createCheckoutSession } = useStripe();

const billingPeriod = ref("monthly");

const selectPlan = async (plan) => {
  if (!isAuthenticated.value) {
    await navigateTo("/register");
    return;
  }

  if (plan === "free") {
    await navigateTo("/rooms");
    return;
  }

  if (plan === "enterprise") {
    // Redirect to contact form or open modal
    return;
  }

  try {
    const priceId = plan === "pro" ? (billingPeriod.value === "yearly" ? "price_pro_yearly" : "price_pro_monthly") : "price_enterprise_monthly";

    await createCheckoutSession(priceId);
  } catch (error) {
    console.error("Error creating checkout session:", error);
  }
};

// SEO
useHead({
  title: "Pricing - Live Timer",
});
</script>
