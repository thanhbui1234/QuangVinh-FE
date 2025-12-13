import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { toast } from 'sonner'

declare global {
  interface Window {
    OneSignal?: any
  }
}

/**
 * Load OneSignal SDK dynamically
 */
async function loadOneSignalSDK(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.OneSignal) {
      resolve(true)
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.onload = () => {
      // Wait for OneSignal to be available
      const checkOneSignal = setInterval(() => {
        if (window.OneSignal) {
          clearInterval(checkOneSignal)
          resolve(true)
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkOneSignal)
        if (!window.OneSignal) {
          resolve(false)
        }
      }, 10000)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

/**
 * Send playerId to backend
 */
async function sendPlayerIdToBackend(playerId: string): Promise<void> {
  try {
    await POST(API_ENDPOINT.ADD_NOTI_PLAYER, { playerId })
    console.log('PlayerId đã được gửi lên backend:', playerId)
  } catch (error) {
    console.error('Lỗi khi gửi playerId lên backend:', error)
    throw error
  }
}

/**
 * Request notification permission
 */
async function requestNotificationPermission(): Promise<boolean> {
  if (!window.OneSignal) {
    return false
  }

  try {
    const permission = await window.OneSignal.User.Push.getPermissionStatus()

    if (permission === 'granted') {
      return true
    }

    // Request permission
    const result = await window.OneSignal.User.Push.requestPermission()

    if (result === 'granted') {
      return true
    } else if (result === 'denied') {
      toast.error('Quyền thông báo bị từ chối. Vui lòng bật trong cài đặt trình duyệt.')
      return false
    } else {
      return false
    }
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error)
    toast.error('Không thể yêu cầu quyền thông báo')
    return false
  }
}

/**
 * Initialize OneSignal and get playerId
 */
export async function initOneSignal(): Promise<boolean> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID

  if (!appId) {
    console.error('VITE_ONESIGNAL_APP_ID chưa được cấu hình')
    toast.error('Cấu hình OneSignal chưa đầy đủ')
    return false
  }

  try {
    // Load OneSignal SDK
    const sdkLoaded = await loadOneSignalSDK()

    if (!sdkLoaded) {
      toast.error('Không thể tải OneSignal SDK. Vui lòng thử lại.')
      return false
    }

    // Initialize OneSignal
    if (!window.OneSignal) {
      toast.error('OneSignal SDK không sẵn sàng')
      return false
    }

    // Check if already initialized
    try {
      const currentAppId = await window.OneSignal.getAppId()
      if (currentAppId === appId) {
        console.log('OneSignal đã được khởi tạo')
      } else {
        // Reinitialize with new appId
        await window.OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
        })
      }
    } catch {
      // Not initialized, initialize now
      await window.OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      })
    }

    // Request notification permission
    const permissionGranted = await requestNotificationPermission()

    if (!permissionGranted) {
      return false
    }

    // Wait for subscription to be created
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Get playerId
    let playerId = await window.OneSignal.User.Push.getSubscriptionId()

    if (!playerId) {
      // Retry after longer wait
      await new Promise((resolve) => setTimeout(resolve, 2000))
      playerId = await window.OneSignal.User.Push.getSubscriptionId()
    }

    if (playerId) {
      await sendPlayerIdToBackend(playerId)
      return true
    } else {
      toast.warning('Không thể lấy playerId. Vui lòng thử lại.')
      return false
    }
  } catch (error) {
    console.error('Lỗi khi khởi tạo OneSignal:', error)
    toast.error('Không thể khởi tạo thông báo. Vui lòng thử lại.')
    return false
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return false
  }

  try {
    const subscriptionId = await window.OneSignal.User.Push.getSubscriptionId()
    const permission = await window.OneSignal.User.Push.getPermissionStatus()

    return permission === 'granted' && !!subscriptionId
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}
