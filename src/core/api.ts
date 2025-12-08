// services/api.ts
import { getAuthorization, logout } from '@/utils/auth'
import { refreshAccessToken } from '@/utils/auth/refreshToken'
import axios, { type AxiosRequestConfig } from 'axios'

// Flag để tránh check lỗi 401 khi login
let isLoginRequest = false
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

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
})

// Attach JWT to every request if exists
api.interceptors.request.use(
  (config) => {
    const token = getAuthorization()

    // Thêm token nếu có
    if (token) {
      config.headers.Authorization = token
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    isLoginRequest = false
    return response.data
  },
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && !isLoginRequest) {
      if (originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    isLoginRequest = false
    return Promise.reject(error)
  }
)

interface RequestConfig extends AxiosRequestConfig {
  rawResponse?: boolean
}

export const GET = async (
  url: string,
  params?: Record<string, unknown>,
  config: RequestConfig = {}
) => {
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : ''
  const urlWithQuery = `${url}${queryString}`
  try {
    const res = await api.get(urlWithQuery, config)
    return config.rawResponse ? res : res.data
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const POST = async (url: string, params: any, config: RequestConfig = {}) => {
  try {
    const res = await api.post(url, params, config)
    return config.rawResponse ? res : res.data
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const PUT = async (url: string, params: any, config: RequestConfig = {}) => {
  try {
    const res = await api.put(url, params, config)
    return config.rawResponse ? res : res.data
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const DELETE = async (url: string, config: RequestConfig = {}) => {
  try {
    const res = await api.delete(url, config)
    return config.rawResponse ? res : res.data
  } catch (e) {
    console.error(e)
    throw e
  }
}

// 67:3  error  Unnecessary try/catch wrapper  no-useless-catch
// 76:3  error  Unnecessary try/catch wrapper  no-useless-catch
// 85:3  error  Unnecessary try/catch wrapper  no-useless-catch
// 94:3  error  Unnecessary try/catch wrapper  no-useless-catch
