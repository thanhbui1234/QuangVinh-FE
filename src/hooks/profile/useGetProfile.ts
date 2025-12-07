import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { profileKey } from '@/constants'

export const useGetProfile = (id: any) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [profileKey.detail(id.toString()), { id }],
    queryFn: () => POST(API_ENDPOINT.GET_PROFILE, { userId: Number(id) }),
    select(data) {
      return data.userInfo
    },
  })
  return { profile: data, isFetching, error }
}
