import { NOTIFICATION_TYPES } from '@/constants/socket'
import type { Socket } from 'socket.io-client'

// Notification message từ server
// demo
export interface NotificationMessage {
  notification_id: number
  message: string
  notification_type: (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
  timestamp: string
  data?: Record<string, unknown>
}

// WebSocket context state
export interface WebSocketContextState {
  socket: Socket | null
  isConnected: boolean
  hasNewNoti: boolean
  messages: string | null
  receiveMessageTime: number | null
  setUnread: React.Dispatch<React.SetStateAction<boolean>>
}
