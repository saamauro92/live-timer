export const useSocket = () => {
  const config = useRuntimeConfig()
  const socket = ref(null)
  const isConnected = ref(false)
  
  const connect = async () => {
    if (socket.value && socket.value.connected) {
      console.log('Socket already connected')
      return
    }
    
    // Disconnect existing socket if any
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    
    console.log('🔌 Connecting to socket URL:', config.public.socketUrl)
    const { io } = await import('socket.io-client')
    socket.value = io(config.public.socketUrl, {
      auth: {
        token: useCookie('auth-token').value
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    })
    console.log('🔌 Socket instance created:', socket.value)
    
    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('Connected to server')
    })
    
    socket.value.on('disconnect', (reason) => {
      isConnected.value = false
      console.log('Disconnected from server:', reason)
    })
    
    socket.value.on('connect_error', (error) => {
      console.error('Connection error:', error)
      isConnected.value = false
    })
    
    socket.value.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts')
      isConnected.value = true
    })
    
    socket.value.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error)
    })
    
    socket.value.on('reconnect_failed', () => {
      console.error('Failed to reconnect')
      isConnected.value = false
    })
  }
  
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }
  
  const joinRoom = (data: { shareToken: string; userId?: string }) => {
    console.log('🔗 Attempting to join room with data:', data)
    if (socket.value) {
      console.log('🔗 Socket available, emitting join-room event')
      socket.value.emit('join-room', data)
    } else {
      console.error('🔗 Socket not available for join-room')
    }
  }
  
  const leaveRoom = (roomId: string) => {
    if (socket.value) {
      socket.value.emit('leave-room', roomId)
    }
  }
  
  const startTimer = (roomId: string, duration: number) => {
    if (socket.value) {
      socket.value.emit('start-timer', { roomId, duration })
    }
  }
  
  const stopTimer = (roomId: string) => {
    if (socket.value) {
      socket.value.emit('stop-timer', roomId)
    }
  }
  
  const pauseTimer = (roomId: string) => {
    if (socket.value) {
      socket.value.emit('pause-timer', roomId)
    }
  }
  
  const resumeTimer = (roomId: string) => {
    if (socket.value) {
      socket.value.emit('resume-timer', roomId)
    }
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  }
}
