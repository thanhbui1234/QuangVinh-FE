// services/api.ts
import { getAuthorization, logout, isAuthenticated } from '@/utils/auth'
import { refreshAccessToken } from '@/utils/auth/refreshToken'
import axios, { type AxiosRequestConfig } from 'axios'

// ============================================
// PUBLIC API (không cần authentication)
// ============================================
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000 * 40,
})

publicApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

// ============================================
// PRIVATE API (cần authentication + auto refresh token)
// ============================================

// Flag để check quá trình refresh token
let isRefreshing = false
// Queue lưu các request failed khi đang refresh token
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export const privateApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000 * 40,
})

// Attach JWT to every request
privateApi.interceptors.request.use(
  (config) => {
    const token = getAuthorization()

    if (token) {
      config.headers.Authorization = token
    }

    return config
  },
  (error) => Promise.reject(error)
)

privateApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Chỉ xử lý 401 nếu user đã login
    if (status === 401 && isAuthenticated()) {
      if (originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return privateApi(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()

        privateApi.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)

        return privateApi(originalRequest)
      } catch (refreshError: any) {
        processQueue(refreshError, null)

        // Nếu refresh token hết hạn → đăng xuất
        const status = refreshError?.response?.status
        const message = refreshError?.response?.data?.message?.toLowerCase() || ''

        if (
          status === 401 ||
          message.includes('refresh') ||
          message.includes('expired') ||
          message.includes('invalid')
        ) {
          logout()
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ============================================
// LEGACY API (deprecated - để backward compatibility)
// ============================================
/**
 * @deprecated Sử dụng publicApi hoặc privateApi thay thế
 */
export const api = privateApi

// ============================================
// HELPER FUNCTIONS
// ============================================
interface RequestConfig extends AxiosRequestConfig {
  rawResponse?: boolean
}

// Public API helpers
export const publicPOST = async (url: string, params: any, config: RequestConfig = {}) => {
  const res = await publicApi.post(url, params, config)
  return config.rawResponse ? res : res.data
}

// Private API helpers
export const POST = async (url: string, params: any, config: RequestConfig = {}) => {
  const res = await privateApi.post(url, params, config)
  return config.rawResponse ? res : res.data
}
