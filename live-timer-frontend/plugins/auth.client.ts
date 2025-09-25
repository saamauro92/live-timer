export default defineNuxtPlugin(async () => {
  const { initializeAuth } = useAuth()
  
  // Initialize authentication state on app start
  await initializeAuth()
})
