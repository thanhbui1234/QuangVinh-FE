'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { useSocket } from '@/hooks/useSocket'
import { getTokenAuth } from '@/utils/auth'
import { SOCKET_CONFIG } from '@/constants/socket'
import { queryClient } from '@/lib/queryClient'
import { notificationsKeys } from '@/constants/queryKey'
import { notiBellKey } from '@/constants'
import { useAuthStore } from '@/stores/authStore'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  hasNewNoti: boolean
  messages: string | null
  receiveMessageTime: number | null
  setUnread: React.Dispatch<React.SetStateAction<boolean>>
}

const SocketContext = createContext<SocketContextValue | null>(null)

/**
 * SocketProvider - Quản lý Socket.IO connection và tích hợp React Query
 *
 * Tại sao dùng context thay cho zustand?
 * - Socket được lưu trong ref → không gây re-render khi emit/on event
 * - Toàn app chỉ cần useSocketContext() để lấy instance
 * - Khi nhận message, auto-invalidate React Query để refetch data
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Chỉ khởi tạo socket khi đã login (có user)
  const { user } = useAuthStore()
  const token = getTokenAuth()

  // Chỉ connect khi có user (đã login thành công)
  const shouldConnect = !!user && !!token

  const { socket, isConnected, messages, receiveMessageTime } = useSocket(SOCKET_CONFIG.URL, {
    auth: { token },
    autoConnect: shouldConnect, // Chỉ auto connect khi đã login
  })

  const [hasNewNoti, setHasNewNoti] = useState(false)

  /**
   * Auto-invalidate React Query khi nhận message mới
   */
  useEffect(() => {
    if (receiveMessageTime) {
      console.log('[SocketProvider] New message received, invalidating queries...')

      // Invalidate tất cả notification queries (cho notification page)
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.all,
      })

      // Invalidate notification bell queries (cho chuông thông báo)
      queryClient.invalidateQueries({
        queryKey: notiBellKey.all,
      })

      // Set flag có notification mới
      setHasNewNoti(true)
    }
  }, [receiveMessageTime])

  const contextValue: SocketContextValue = {
    socket,
    isConnected,
    hasNewNoti,
    messages,
    receiveMessageTime,
    setUnread: setHasNewNoti,
  }

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider')
  }
  return context
}
