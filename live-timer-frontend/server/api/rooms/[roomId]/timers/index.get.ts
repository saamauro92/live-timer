export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  const roomId = getRouterParam(event, 'roomId')

  if (!roomId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID is required'
    })
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${roomId}/timers`, {
      headers
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to get timers'
    })
  }
})
