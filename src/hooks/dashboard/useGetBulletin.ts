import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { gtNotiId } from '@/constants/defaultQuery'

const QUERY = {
  size: 3,
  gtNotiId,
}

export const useGetBulletin = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['dashboard-bulletin'],
    queryFn: () => POST(API_ENDPOINT.GET_NOTIFICATION, { ...QUERY }),
    select: (data) => data.notifications,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchOnMount: true,
  })
  return { bulletins: data, isFetching, error, refetch }
}
