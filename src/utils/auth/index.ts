import { queryClient } from '@/lib/queryClient'
export const getAuthorization = () => {
  const token = getTokenAuth()
  return token ? `Bearer ${token}` : undefined
}

export const setTokenAuth = (token: string, refreshToken: string) => {
  localStorage.setItem('token', token)
  localStorage.setItem('refreshToken', refreshToken)
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('auth-storage')
  queryClient.clear()
  window.location.href = '/login'
}

export const getTokenAuth = () => {
  return localStorage.getItem('token')
}

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

export const isAuthenticated = () => {
  const token = getTokenAuth()
  return !!token
}

/**
 * Get userId from JWT token
 * Note: This is a simple implementation. In production, use proper JWT decode library
 */
export const getUserId = (): string | null => {
  const token = getTokenAuth()
  if (!token) return null

  try {
    // JWT format: header.payload.signature
    const payload = token.split('.')[1]
    if (!payload) return null

    // Decode base64
    const decoded = JSON.parse(atob(payload))
    return decoded.userId || decoded.sub || decoded.id || null
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}
