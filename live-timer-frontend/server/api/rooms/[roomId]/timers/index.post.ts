export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')
  const roomId = getRouterParam(event, 'roomId')
  const body = await readBody(event)
  
  if (!roomId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID is required'
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
    
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${roomId}/timers`, {
      method: 'POST',
      body,
      headers
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to create timer'
    })
  }
})
