import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSocketContext } from '@/providers/SocketProvider'
import { NOTIFICATION_TYPES } from '@/constants/socket'

/**
 * Hook để lắng nghe Socket.IO notification events và hiển thị toast
 *
 * Gọi hook này trong WebLayout để tự động nhận và hiển thị notifications
 */
export function useNotifications() {
  const { messages, receiveMessageTime } = useSocketContext()

  useEffect(() => {
    if (!messages || !receiveMessageTime) return

    try {
      const data = JSON.parse(messages)

      // Handle different notification types với toast tương ứng
      switch (data.notification_type) {
        case NOTIFICATION_TYPES.TASK_ASSIGNED:
          toast.info(`📋 ${data.message}`, {
            description: 'Bạn có task mới cần xử lý',
            duration: 5000,
          })
          break

        case NOTIFICATION_TYPES.TASK_UPDATED:
          toast.info(`🔄 ${data.message}`, {
            duration: 4000,
          })
          break

        case NOTIFICATION_TYPES.TASK_COMPLETED:
          toast.success(`✅ ${data.message}`, {
            duration: 4000,
          })
          break

        case NOTIFICATION_TYPES.TASK_DELETED:
          toast.warning(`🗑️ ${data.message}`, {
            duration: 4000,
          })
          break

        case NOTIFICATION_TYPES.COMMENT_ADDED:
          toast.info(`💬 ${data.message}`, {
            duration: 4000,
          })
          break

        default:
          // Generic notification
          toast.info(data.message || 'Bạn có thông báo mới')
      }
    } catch (error) {
      console.error('[useNotifications] Failed to parse message:', error)
    }
  }, [receiveMessageTime, messages])
}
