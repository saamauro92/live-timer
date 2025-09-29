export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')
  const body = await readBody(event)
  const { timerIds } = body

  if (!roomId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID is required'
    })
  }

  if (!Array.isArray(timerIds) || timerIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid timer IDs'
    })
  }

  try {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth-token')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const response = await $fetch(`${config.public.apiBase}/api/rooms/${roomId}/timers/reorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { timerIds }
    })

    return response
  } catch (error: any) {
    console.error('Error reordering timers:', error)
    
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage || 'Failed to reorder timers'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
