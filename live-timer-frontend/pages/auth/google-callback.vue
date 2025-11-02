<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">
          {{ loading ? 'Authenticating...' : error ? 'Authentication Failed' : 'Authentication Successful' }}
        </h2>
        <div class="mt-4">
          <div v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="ml-3 text-gray-600">Please wait while we complete your authentication...</p>
          </div>
          <div v-else-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Authentication Error</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ error }}</p>
                </div>
                <div class="mt-4">
                  <button
                    @click="handleRetry"
                    class="text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Success!</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>You have been successfully authenticated. Redirecting...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: false,
});

const route = useRoute();
const router = useRouter();
const { setUser } = useAuth();

const loading = ref(true);
const error = ref<string | null>(null);

const handleRetry = () => {
  router.push('/login');
};

const handleCallback = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Check for error from query params
    const errorParam = route.query.error as string;
    if (errorParam) {
      error.value = getErrorMessage(errorParam);
      loading.value = false;
      return;
    }

    // Check for success with token
    const success = route.query.success as string;
    const token = route.query.token as string;

    if (success === 'true' && token) {
      try {
        // Store token first
        const authToken = useCookie('auth-token', {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        authToken.value = token;

        // Try to parse user data from query if available (for immediate UI update)
        const userParam = route.query.user as string;
        if (userParam) {
          try {
            // Nuxt automatically decodes query params, but the backend double-encodes
            // Try parsing directly first
            let userData: unknown;
            try {
              userData = JSON.parse(userParam);
            } catch {
              // If direct parse fails, try decoding (handles double-encoding)
              userData = JSON.parse(decodeURIComponent(userParam));
            }
            setUser(userData as { id: string; email: string; name: string; image: string | null; emailVerified: boolean; createdAt: string });
          } catch (parseError) {
            // If parsing fails, we'll fetch from backend instead
            console.warn('Could not parse user from URL, will fetch from backend:', parseError);
          }
        }

        // Always fetch user from backend to ensure we have the latest data
        // This is more reliable than parsing from URL
        const { fetchUser } = useAuth();
        await fetchUser();

        // Clear loading and redirect
        loading.value = false;
        await router.push('/rooms');
      } catch (authError) {
        console.error('Error during authentication:', authError);
        error.value = authError instanceof Error ? authError.message : 'Authentication failed';
        loading.value = false;
      }
    } else {
      error.value = 'Invalid authentication response';
      loading.value = false;
    }
  } catch (err) {
    console.error('Callback error:', err);
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
    loading.value = false;
  }
};

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    access_denied: 'You denied access to your Google account. Please try again and grant access.',
    no_code: 'No authorization code received from Google. Please try again.',
    invalid_token: 'Invalid authentication token. Please try again.',
    no_email: 'Your Google account does not have an email address. Please use a different account.',
    account_banned: 'This account has been banned. Please contact support for more information.',
    server_error: 'An error occurred on the server. Please try again later.',
    oauth_not_configured: 'Google OAuth is not properly configured. Please contact support.',
  };

  return errorMessages[errorCode] || `Authentication failed: ${errorCode}`;
};

onMounted(() => {
  handleCallback();
});
</script>

