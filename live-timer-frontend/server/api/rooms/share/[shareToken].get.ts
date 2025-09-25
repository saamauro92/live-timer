export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const shareToken = getRouterParam(event, 'shareToken')
  
  console.log('Frontend API: Received shareToken:', shareToken)
  console.log('Frontend API: Backend URL:', `${config.public.apiBase}/api/rooms/${shareToken}`)
  
  if (!shareToken) {
    console.error('Frontend API: No shareToken provided')
    throw createError({
      statusCode: 400,
      statusMessage: 'Share token is required'
    })
  }
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/rooms/share/${shareToken}`, {
      method: 'GET'
    })
    
    console.log('Frontend API: Backend response for shareToken:', response)
    return response
  } catch (error: any) {
    console.error('Frontend API: Error fetching room:', error)
    console.error('Frontend API: Error details:', {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data,
      message: error.message
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.statusMessage || 'Failed to fetch room'
    })
  }
})
