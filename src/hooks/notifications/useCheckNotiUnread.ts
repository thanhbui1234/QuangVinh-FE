import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsKeys } from '@/constants/queryKey'
import { isAuthenticated } from '@/utils/auth'

// Types cho notification response
interface NotificationItem {
  id: number
  message: string
  notification_type: string
  read: boolean
  created_at: string
}

interface NotificationResponse {
  data: NotificationItem[]
  contain_unread: boolean
  total: number
  page: number
  size: number
}

export function useCheckNotiUnread() {
  const { data, isLoading, error } = useQuery<NotificationResponse>({
    queryKey: notificationsKeys.getAll,
    queryFn: async () => {
      // TODO: Replace với API endpoint thật
      // const response = await GET('/api/notifications', { page: 0, size: 20 })
      // return response

      // Mock data for now
      return {
        data: [],
        contain_unread: false,
        total: 0,
        page: 0,
        size: 20,
      }
    },
    enabled: isAuthenticated(),
    refetchOnMount: 'always', // Luôn refetch khi component mount
    staleTime: 0, // Data luôn stale → sẽ refetch khi invalidate
  })

  const isUnread = useMemo(() => {
    return !!data?.contain_unread
  }, [data])

  return {
    isUnread,
    notifications: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
  }
}
