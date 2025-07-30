import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketMessage {
  type: string
  productId: string
  timestamp: string
  data?: any
  alert?: any
  analysis?: any
}

interface UseWebSocketOptions {
  productId?: string
  autoConnect?: boolean
  onPriceUpdate?: (data: any) => void
  onPriceAlert?: (alert: any) => void
  onMarketAnalysis?: (analysis: any) => void
  onTrackingStatus?: (status: string) => void
  onError?: (error: any) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    productId,
    autoConnect = true,
    onPriceUpdate,
    onPriceAlert,
    onMarketAnalysis,
    onTrackingStatus,
    onError
  } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return
    }

    setIsConnecting(true)
    setError(null)

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id)
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)

      // Join product room if productId is provided
      if (productId) {
        socket.emit('join-product', productId)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setIsConnected(false)
      setIsConnecting(false)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect()
      }
    })

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      setError(err.message)
      setIsConnecting(false)
      onError?.(err)
    })

    // Handle real-time updates
    socket.on('price-update', (message: WebSocketMessage) => {
      console.log('Price update received:', message)
      setLastMessage(message)
      onPriceUpdate?.(message.data)
    })

    socket.on('price-alert', (message: WebSocketMessage) => {
      console.log('Price alert received:', message)
      setLastMessage(message)
      onPriceAlert?.(message.alert)
    })

    socket.on('market-analysis', (message: WebSocketMessage) => {
      console.log('Market analysis received:', message)
      setLastMessage(message)
      onMarketAnalysis?.(message.analysis)
    })

    socket.on('tracking-status', (message: WebSocketMessage) => {
      console.log('Tracking status received:', message)
      setLastMessage(message)
      onTrackingStatus?.(message.data?.status)
    })

    socket.on('tracking-started', (message: WebSocketMessage) => {
      console.log('Tracking started:', message)
      setLastMessage(message)
    })

    socket.on('tracking-error', (message: WebSocketMessage) => {
      console.error('Tracking error:', message)
      setError(message.data?.error || 'Tracking error occurred')
      onError?.(message.data)
    })

    socketRef.current = socket
  }, [productId, onPriceUpdate, onPriceAlert, onMarketAnalysis, onTrackingStatus, onError])

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setIsConnecting(false)
    }
  }, [])

  // Join product room
  const joinProduct = useCallback((newProductId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-product', newProductId)
    }
  }, [])

  // Leave product room
  const leaveProduct = useCallback((productIdToLeave: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-product', productIdToLeave)
    }
  }, [])

  // Start tracking
  const startTracking = useCallback((data: { productId: string, competitors: string[] }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('start-tracking', data)
    }
  }, [])

  // Send custom message
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Update product room when productId changes
  useEffect(() => {
    if (productId && socketRef.current?.connected) {
      socketRef.current.emit('join-product', productId)
    }
  }, [productId])

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    lastMessage,
    error,
    connect,
    disconnect,
    joinProduct,
    leaveProduct,
    startTracking,
    sendMessage
  }
} 