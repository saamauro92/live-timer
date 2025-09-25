export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Get all rooms from backend for debugging
    const response = await $fetch(`${config.public.apiBase}/api/debug/rooms`, {
      method: 'GET'
    })
    
    console.log('Debug: All rooms:', response)
    return response
  } catch (error: any) {
    console.error('Debug: Error fetching rooms:', error)
    return {
      error: true,
      message: 'Failed to fetch rooms',
      details: error.message
    }
  }
})
