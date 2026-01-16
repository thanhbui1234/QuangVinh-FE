import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { notiBellKey } from '@/constants'
import { gtNotiId } from '@/constants/defaultQuery'

const QUERY = {
  size: 5,
  gtNotiId,
}

export const useGetNotiBell = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: [notiBellKey.list],
    queryFn: () => POST(API_ENDPOINT.GET_NOTIFICATION, { ...QUERY }),
    select: (data) => data.notifications,
    refetchOnMount: 'always', // Luôn refetch khi component mount
    staleTime: 0, // Data luôn stale → sẽ refetch khi invalidate
    refetchInterval: 5000, // Tự động refetch mỗi 5 giây để lấy danh sách mới nhất
  })
  return { notifications: data, isFetching, error, refetch }
}
