import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { profileKey } from '@/constants'

export const useGetProfile = (id: string) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [profileKey.detail(id.toString()), { id }],
    queryFn: () => POST(API_ENDPOINT.GET_PROFILE, { id: Number(id) }),
    select(data) {
      return data
    },
  })
  return { profile: data, isFetching, error }
}
