<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">LT</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Verify Your Email</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">We've sent a verification link to your email address</p>
      </div>

      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="isVerifying" class="text-center">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verifying your email...</h3>
          <p class="text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verificationSuccess" class="text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Verified!</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Your email has been successfully verified. You can now access all features.</p>
          <NuxtLink to="/rooms" class="w-full btn-primary py-3 text-lg"> Go to Dashboard </NuxtLink>
        </div>

        <!-- Error State -->
        <div v-else-if="verificationError" class="text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ verificationError }}</p>
          <div class="space-y-3">
            <button @click="retryVerification" :disabled="isRetrying" class="w-full btn-secondary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isRetrying ? "Retrying..." : "Try Again" }}
            </button>
            <NuxtLink to="/register" class="block w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
              Back to Registration
            </NuxtLink>
          </div>
        </div>

        <!-- Manual Token Input -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter Verification Token</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">If you have a verification token from your email, enter it below:</p>
          </div>

          <form @submit.prevent="verifyWithToken" class="space-y-4">
            <div>
              <label for="token" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> Verification Token </label>
              <input id="token" v-model="verificationToken" type="text" required class="input-field" placeholder="Enter your verification token" />
            </div>

            <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <button type="submit" :disabled="isVerifying || !verificationToken" class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isVerifying ? "Verifying..." : "Verify Email" }}
            </button>
          </form>

          <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Didn't receive the email?</p>
            <button @click="showResendForm = !showResendForm" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm">
              Resend verification email
            </button>
          </div>

          <!-- Resend Form -->
          <div v-if="showResendForm" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">Resend Verification Email</h4>
            <form @submit.prevent="resendVerification" class="space-y-3">
              <input v-model="resendEmail" type="email" required class="input-field" placeholder="Enter your email address" />
              <button type="submit" :disabled="isResending" class="w-full btn-secondary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isResending ? "Sending..." : "Resend Email" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();

// State
const isVerifying = ref(false);
const isRetrying = ref(false);
const isResending = ref(false);
const verificationSuccess = ref(false);
const verificationError = ref("");
const verificationToken = ref("");
const resendEmail = ref("");
const showResendForm = ref(false);
const error = ref("");

// Get token from URL query parameter
const tokenFromUrl = route.query.token;

// Auto-verify if token is in URL
onMounted(async () => {
  if (tokenFromUrl) {
    // Handle case where token might be an array
    const token = Array.isArray(tokenFromUrl) ? tokenFromUrl[0] : tokenFromUrl;
    verificationToken.value = token;
    await verifyWithToken();
  }
});

const verifyWithToken = async () => {
  if (!verificationToken.value) {
    error.value = "Please enter a verification token";
    return;
  }

  isVerifying.value = true;
  error.value = "";
  verificationError.value = "";

  try {
    const response = await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { token: verificationToken.value },
    });

    if (response.success) {
      verificationSuccess.value = true;
      // Store user data if provided
      if (response.user) {
        // You might want to store this in your auth store
        console.log("User verified:", response.user);
      }
    } else {
      verificationError.value = response.message || "Verification failed";
    }
  } catch (err) {
    verificationError.value = err?.data?.message || "Verification failed";
  } finally {
    isVerifying.value = false;
  }
};

const retryVerification = async () => {
  isRetrying.value = true;
  verificationError.value = "";

  // Clear the form and reset state
  verificationToken.value = "";
  error.value = "";

  setTimeout(() => {
    isRetrying.value = false;
  }, 1000);
};

const resendVerification = async () => {
  if (!resendEmail.value) {
    error.value = "Please enter your email address";
    return;
  }

  isResending.value = true;
  error.value = "";

  try {
    const response = await $fetch("/api/auth/resend-verification", {
      method: "POST",
      body: { email: resendEmail.value },
    });

    if (response.success) {
      // Show success message
      error.value = "";
      showResendForm.value = false;
      resendEmail.value = "";

      // You could show a success toast here
      alert("Verification email sent! Please check your inbox.");
    } else {
      error.value = response.message || "Failed to resend verification email";
    }
  } catch (err) {
    error.value = err?.data?.message || "Failed to resend verification email";
  } finally {
    isResending.value = false;
  }
};

// SEO
useHead({
  title: "Verify Email - Live Timer",
});
</script>
