import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { notificationsKeys } from '@/constants/queryKey'
import { gtNotiId } from '@/constants/defaultQuery'

const QUERY = {
  size: 10, // Load 10 notifications initially
  gtNotiId,
}

export const useGetNotificationsPage = () => {
  const { data, isFetching, error } = useQuery({
    queryKey: notificationsKeys.getAll,
    queryFn: () => POST(API_ENDPOINT.GET_NOTIFICATION, { ...QUERY }),
    select: (data) => data.notifications,
    refetchOnMount: 'always', // Luôn refetch khi component mount
    staleTime: 0, // Data luôn stale → sẽ refetch khi invalidate
  })
  return { notifications: data, isFetching, error }
}
