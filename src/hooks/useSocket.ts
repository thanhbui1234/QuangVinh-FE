import { SOCKET_EVENTS } from '@/constants/socket'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(url: string, options?: any) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string | null>(null)
  const [receiveMessageTime, setReceiveMessageTime] = useState<number | null>(null)

  useEffect(() => {
    const socket = io(url, {
      ...options,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      timeout: 10000,
      // Custom ping/pong
      pingInterval: 15000,
      pingTimeout: 30000,
    })

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setIsConnected(true)
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      setIsConnected(false)
    })

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (_error) => {
      // console.error('Socket.IO Connection Error:', error)
    })

    socket.on(SOCKET_EVENTS.NOTIFICATION, (data) => {
      setMessages(typeof data === 'string' ? data : JSON.stringify(data))
      setReceiveMessageTime(Date.now())
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [url, options])

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    receiveMessageTime,
  }
}
