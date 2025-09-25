export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const shareToken = getRouterParam(event, 'shareToken')
  
  if (!shareToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Share token is required'
    })
  }
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/rooms/${shareToken}/timers`, {
      method: 'GET'
    })
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to fetch timers'
    })
  }
})
