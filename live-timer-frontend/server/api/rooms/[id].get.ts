export default defineEventHandler(async (event) => {
  try {
    // Get the auth token from cookies or headers (optional)
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    // Get the room ID from the route params
    const roomId = getRouterParam(event, 'id')
    
    if (!roomId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Room ID is required'
      })
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Add auth token if available, but don't require it
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Make request to backend
    const response = await $fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/rooms/${roomId}`, {
      headers
    })

    return response
  } catch (error: any) {
    console.error('Error fetching room by ID:', error)
    
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage || 'Failed to fetch room'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
