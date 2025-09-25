// Global auth state
const globalUser = ref(null)
const globalIsLoading = ref(false)
let authInitialized = false

export const useAuthState = () => {
  const user = globalUser
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = globalIsLoading

  const setUser = (userData: any) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const isInitialized = () => authInitialized

  const markInitialized = () => {
    authInitialized = true
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    setUser,
    clearUser,
    setLoading,
    isInitialized,
    markInitialized
  }
}
