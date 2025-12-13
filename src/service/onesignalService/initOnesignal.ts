import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { toast } from 'sonner'

declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(OneSignal: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

async function addPlayerIdToBackend(playerId: string) {
  try {
    await POST(API_ENDPOINT.ADD_NOTI_PLAYER, { playerId })
    console.log('PlayerId đã được thêm vào backend:', playerId)
    toast.success('Đã đăng ký thiết bị nhận thông báo thành công')
  } catch (error) {
    console.error('Lỗi khi thêm playerId vào backend:', error)
  }
}

let initPromise: Promise<boolean> | null = null

function loadOneSignalSDK() {
  if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) return

  const script = document.createElement('script')
  script.src = ONE_SIGNAL_SDK_URL
  script.async = true
  document.body.appendChild(script)
}

export async function requestNotificationPermission() {
  const permission = await window.OneSignal.User.Push.getPermissionStatus()
  console.log('Permission:', permission)

  if (permission === 'granted') return true

  const result = await window.OneSignal.User.Push.requestPermission()
  console.log('Result requestPermission:', result)

  return result === 'granted'
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

    // User is subscribed if they have permission granted and a subscription ID
    return permission === 'granted' && !!subscriptionId
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}

export async function initOneSignal(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // If OneSignal is already initialized, just request permission and get playerId
  if (window.OneSignal) {
    try {
      // Request permission if not granted
      await requestNotificationPermission()

      // Wait a bit for subscription to be created
      await new Promise((resolve) => setTimeout(resolve, 500))

      const playerId = await window.OneSignal.User.Push.getSubscriptionId()
      console.log('playerId:', playerId)

      if (playerId) {
        await addPlayerIdToBackend(playerId)
      }

      return true
    } catch (error) {
      console.error('Error initializing OneSignal (already loaded):', error)
      return false
    }
  }

  if (initPromise) return initPromise

  initPromise = new Promise<boolean>((resolve, reject) => {
    try {
      loadOneSignalSDK()

      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: '/OneSignalSDKWorker.js',
          })

          console.log('OneSignal init success')

          // Request permission
          await requestNotificationPermission()

          // Wait a bit for subscription to be created after permission is granted
          await new Promise((resolve) => setTimeout(resolve, 500))

          const playerId = await OneSignal.User.Push.getSubscriptionId()
          console.log('playerId:', playerId)

          if (playerId) {
            await addPlayerIdToBackend(playerId)
          }

          initPromise = null
          resolve(true)
        } catch (error) {
          initPromise = null
          reject(error)
        }
      })
    } catch (error) {
      initPromise = null
      reject(error)
    }
  })

  return initPromise
}
