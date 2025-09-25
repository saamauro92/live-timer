export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get token from either cookie or Authorization header
  let token = getCookie(event, 'auth-token')
  
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  const body = await readBody(event)
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/rooms`, {
      method: 'POST',
      body,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to create room'
    })
  }
})
