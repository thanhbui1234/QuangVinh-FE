import { API_ENDPOINT } from '@/common'
import { getRefreshToken } from '@/utils/auth'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * Refresh access token
 * Can be safely used inside axios interceptor
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const { setAuth, user } = useAuthStore.getState()

  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}${API_ENDPOINT.REFRESH_TOKEN}`,
    { refreshToken }
  )

  // Backend trả về { data: { token, refreshToken } }
  const { token, refreshToken: newRefreshToken } = response.data.data

  if (!token) {
    window.location.href = '/login'
    throw new Error('No token returned from refresh endpoint')
  }

  // ✅ Update store
  setAuth(user!, token, newRefreshToken)

  return token
}
