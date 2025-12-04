import { API_ENDPOINT } from '@/common'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { getRefreshToken } from '@/utils/auth'
export const useRefreshToken = () => {
  const refreshTokenQuery = useQuery({
    queryKey: [API_ENDPOINT.REFRESH_TOKEN],
    queryFn: async () => {
      const refreshToken = getRefreshToken()
      const response = await POST(API_ENDPOINT.REFRESH_TOKEN, {
        refreshToken: refreshToken as unknown as string,
      })
      return response
    },
  })
  return { refreshTokenQuery }
}
