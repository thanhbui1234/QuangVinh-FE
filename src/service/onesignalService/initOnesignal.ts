import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { toast } from 'sonner'

declare global {
  interface Window {
    OneSignal?: any
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'

let isListenerAttached = false

/**
 * Load OneSignal SDK
 */
async function loadOneSignalSDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.OneSignal) {
      resolve(true)
      return
    }

    if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = ONE_SIGNAL_SDK_URL
    script.defer = true

    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.head.appendChild(script)
  })
}

/**
 * Send playerId to backend
 */
async function sendPlayerIdToBackend(playerId: string) {
  try {
    await POST(API_ENDPOINT.ADD_NOTI_PLAYER, { playerId })
    console.log('[OneSignal] playerId sent:', playerId)
    toast.success('Đã đăng ký thiết bị nhận thông báo')
  } catch (error) {
    console.error('[OneSignal] send playerId error:', error)
    toast.error('Không thể đăng ký thiết bị nhận thông báo')
  }
}

/**
 * Init OneSignal & handle subscription
 * ⚠️ BẮT BUỘC gọi trong user action (onClick)
 */
export async function initOneSignal(): Promise<boolean> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID

  if (!appId) {
    toast.error('Thiếu VITE_ONESIGNAL_APP_ID')
    return false
  }

  // 1️⃣ Load SDK
  const sdkLoaded = await loadOneSignalSDK()
  if (!sdkLoaded || !window.OneSignal) {
    toast.error('Không thể tải OneSignal SDK')
    return false
  }

  // 2️⃣ Init OneSignal (chỉ init 1 lần)
  try {
    const currentAppId = await window.OneSignal.getAppId()
    if (currentAppId !== appId) {
      await window.OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      })
    }
  } catch {
    await window.OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    })
  }

  // 3️⃣ Listen subscription change (CHỈ GẮN 1 LẦN)
  if (!isListenerAttached) {
    isListenerAttached = true

    window.OneSignal.User.Push.addEventListener('subscriptionChange', (event: any) => {
      const playerId = event.current?.id
      if (playerId) {
        console.log('[OneSignal] subscription ready:', playerId)
        sendPlayerIdToBackend(playerId)
      }
    })
  }

  // 4️⃣ Request permission (user gesture)
  const permission = await window.OneSignal.User.Push.requestPermission()

  if (permission !== 'granted') {
    toast.warning('Bạn chưa cho phép nhận thông báo')
    return false
  }

  // 5️⃣ Nếu đã có sẵn subscription → gửi luôn
  const existingPlayerId = await window.OneSignal.User.Push.getSubscriptionId()

  if (existingPlayerId) {
    sendPlayerIdToBackend(existingPlayerId)
  }

  return true
}

/**
 * Check subscription status
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!window.OneSignal) return false

  const permission = await window.OneSignal.User.Push.getPermissionStatus()
  const playerId = await window.OneSignal.User.Push.getSubscriptionId()

  return permission === 'granted' && !!playerId
}
