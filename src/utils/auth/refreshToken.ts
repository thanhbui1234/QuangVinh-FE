import { API_ENDPOINT } from '@/common'
import { getRefreshToken, setTokenAuth } from '@/utils/auth'
import axios from 'axios'

/**
 * Simple function to refresh the access token
 * Returns the new token or throws an error
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Use axios directly to avoid interceptor loop
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}${API_ENDPOINT.REFRESH_TOKEN}`,
    { refreshToken }
  )

  // Backend trả về { data: { token, refreshToken } }
  const { token, refreshToken: newRefreshToken } = response.data.data
  setTokenAuth(token, newRefreshToken || refreshToken)

  if (!token) {
    window.location.href = '/login'
    throw new Error('No token returned from refresh endpoint')
  }

  // Update local storage with new tokens

  return token
}
