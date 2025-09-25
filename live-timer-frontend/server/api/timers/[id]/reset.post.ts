export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  const timerId = getRouterParam(event, 'id')
  
  if (!timerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Timer ID is required'
    })
  }
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Add auth token if available, but don't require it
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await $fetch(`${config.public.apiBase}/api/timers/${timerId}/reset`, {
      method: 'POST',
      headers
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to reset timer'
    })
  }
})
