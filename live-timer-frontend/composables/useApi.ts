export const useApi = () => {
  const api = $fetch.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest({ request, options }) {
      // Add auth token if available
      const token = useCookie('auth-token')
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        navigateTo('/login')
      }
    }
  })

  return { api }
}

// Secure API composable for rooms
export const useRoomApi = () => {
  const createRoom = async (data: { name: string; description?: string }) => {
    return await $fetch('/api/rooms', {
      method: 'POST',
      body: data
    })
  }

  const getRoomByShareToken = async (shareToken: string) => {
    return await $fetch(`/api/rooms/${shareToken}`)
  }

  return {
    createRoom,
    getRoomByShareToken
  }
}

// Secure API composable for timers
export const useTimerApi = () => {
  const createTimer = async (roomId: string, data: { title: string; description?: string; duration: number }) => {
    return await $fetch(`/api/rooms/${roomId}/timers`, {
      method: 'POST',
      body: data
    })
  }

  const getTimers = async (roomId: string) => {
    return await $fetch(`/api/rooms/${roomId}/timers`)
  }

  const updateTimer = async (timerId: string, data: any) => {
    return await $fetch(`/api/timers/${timerId}`, {
      method: 'PUT',
      body: data
    })
  }

  const deleteTimer = async (timerId: string) => {
    return await $fetch(`/api/timers/${timerId}`, {
      method: 'DELETE'
    })
  }

  const startTimer = async (timerId: string) => {
    return await $fetch(`/api/timers/${timerId}/start`, {
      method: 'POST'
    })
  }

  const pauseTimer = async (timerId: string) => {
    return await $fetch(`/api/timers/${timerId}/pause`, {
      method: 'POST'
    })
  }

  const resetTimer = async (timerId: string) => {
    return await $fetch(`/api/timers/${timerId}/reset`, {
      method: 'POST'
    })
  }

  return {
    createTimer,
    getTimers,
    updateTimer,
    deleteTimer,
    startTimer,
    pauseTimer,
    resetTimer
  }
}