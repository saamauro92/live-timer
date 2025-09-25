export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  const timerId = getRouterParam(event, 'id')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  if (!timerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Timer ID is required'
    })
  }
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/timers/${timerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to delete timer'
    })
  }
})
