export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side to avoid SSR issues
  if (process.server) return
  
  try {
    const { isAuthenticated } = useAuth()
    
    // List of routes that require authentication
    const protectedRoutes = ['/dashboard', '/rooms']
    
    // Check if the current route requires authentication
    const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route))
    
    if (requiresAuth && !isAuthenticated.value) {
      return navigateTo('/login')
    }
    
    // Redirect authenticated users away from auth pages
    if ((to.path === '/login' || to.path === '/register') && isAuthenticated.value) {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    // Silently handle auth errors during development
    if (process.dev) {
      console.warn('Auth middleware error:', error)
    }
  }
})
