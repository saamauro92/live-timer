<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">LT</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Sign in to your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500"> create a new account </NuxtLink>
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Email address </label>
            <input id="email" v-model="form.email" type="email" required class="input-field mt-1" placeholder="Enter your email" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"> Password </label>
            <input id="password" v-model="form.password" type="password" required class="input-field mt-1" placeholder="Enter your password" />
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const { isAuthenticated, login, isLoading } = useAuth();

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
  email: "",
  password: "",
});

const error = ref("");

const handleLogin = async () => {
  error.value = "";

  const result = await login(form.value.email, form.value.password);

  if (result.success) {
    await navigateTo("/rooms");
  } else {
    error.value = result.error;
  }
};

// SEO
useHead({
  title: "Sign In - Live Timer",
});
</script>
