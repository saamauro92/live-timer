<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">LT</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500"> sign in to your existing account </NuxtLink>
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Full name </label>
            <input id="name" v-model="form.name" type="text" required class="input-field mt-1" placeholder="Enter your full name" />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Email address </label>
            <input id="email" v-model="form.email" type="email" required class="input-field mt-1" placeholder="Enter your email" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Password </label>
            <input id="password" v-model="form.password" type="password" required class="input-field mt-1" placeholder="Create a password" />
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <div v-if="success" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <p class="text-sm text-green-600 dark:text-green-400">{{ success }}</p>
          <div v-if="success.includes('check your email')" class="mt-3">
            <button
              @click="resendVerificationEmail"
              :disabled="isResending"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isResending ? "Sending..." : "Didn't receive the email? Resend verification" }}
            </button>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="handleGoogleLogin"
              :disabled="isLoading"
              class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span v-if="isLoading">Signing up with Google...</span>
              <span v-else>Sign up with Google</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const { isAuthenticated, register, loginWithGoogle, isLoading } = useAuth();

// Redirect if already authenticated
watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      navigateTo("/rooms");
    }
  },
  { immediate: true }
);

const form = ref({
  name: "",
  email: "",
  password: "",
});

const error = ref("");
const success = ref("");
const isResending = ref(false);

const handleRegister = async () => {
  error.value = "";
  success.value = "";

  const result = await register(form.value.email, form.value.password, form.value.name);

  if (result.success) {
    if (result.requiresEmailVerification) {
      success.value = `Account created successfully! Please check your email (${form.value.email}) to verify your account.`;
      // Don't redirect, show verification message instead
    } else {
      success.value = "Account created successfully! Redirecting...";
      setTimeout(() => {
        navigateTo("/rooms");
      }, 1500);
    }
  } else {
    error.value = result.error;
  }
};

const resendVerificationEmail = async () => {
  if (!form.value.email) {
    error.value = "Please enter your email address first";
    return;
  }

  isResending.value = true;
  error.value = "";

  try {
    const response = await $fetch("/api/auth/resend-verification", {
      method: "POST",
      body: { email: form.value.email },
    });

    if (response.success) {
      success.value = `Verification email sent to ${form.value.email}. Please check your inbox.`;
    } else {
      error.value = response.message || "Failed to resend verification email";
    }
  } catch (err) {
    error.value = err?.data?.message || "Failed to resend verification email";
  } finally {
    isResending.value = false;
  }
};

const handleGoogleLogin = async () => {
  error.value = "";
  success.value = "";

  try {
    await loginWithGoogle();
  } catch (err) {
    error.value = err.message || "Google authentication failed";
  }
};

// SEO
useHead({
  title: "Sign Up - Live Timer",
});
</script>
