import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { notiBellKey } from '@/constants'
import { fromNotiId, size } from '@/constants/defaultQuery'

const QUERY = {
  fromNotiId,
  size,
}
export const useGetNotiBell = () => {
  const { data, isFetching, error } = useQuery({
    queryKey: [notiBellKey.list],
    queryFn: () => POST(API_ENDPOINT.GET_NOTIFICATION, { ...QUERY }),
    select: (data) => data.notifications,
    refetchInterval: 15_000,
    refetchOnMount: 'always', // Luôn refetch khi component mount
    staleTime: 0, // Data luôn stale → sẽ refetch khi invalidate
  })
  return { notifications: data, isFetching, error }
}
