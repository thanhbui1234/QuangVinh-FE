import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { toast } from 'sonner'

declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(os: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'

let isListenerAttached = false
let lastSentPlayerId: string | null = null

function ensureDeferred() {
  window.OneSignalDeferred = window.OneSignalDeferred || []
}

async function loadOneSignalSDK(): Promise<boolean> {
  if (window.OneSignal) return true

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = ONE_SIGNAL_SDK_URL
    script.defer = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

function getPlayerIdSafe(): Promise<string | null> {
  return new Promise((resolve) => {
    ensureDeferred()
    window.OneSignalDeferred!.push((OneSignal: any) => {
      try {
        const id = OneSignal?.User?.PushSubscription?.id as string | undefined
        resolve(id ?? null)
      } catch (e) {
        console.error('[OneSignal] read PushSubscription.id error', e)
        resolve(null)
      }
    })
  })
}

async function sendPlayerIdIfNeeded() {
  const playerId = await getPlayerIdSafe()
  if (!playerId) return

  if (playerId === lastSentPlayerId) return
  lastSentPlayerId = playerId

  try {
    await POST(API_ENDPOINT.ADD_NOTI_PLAYER, { playerId })
    console.log('[OneSignal] playerId sent:', playerId)
    toast.success('Đã đăng ký thiết bị nhận thông báo')
  } catch (error) {
    console.error('[OneSignal] send playerId error:', error)
    toast.error('Không thể đăng ký thiết bị nhận thông báo')
  }
}

export async function initOneSignal(): Promise<boolean> {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId) {
    toast.error('Thiếu VITE_ONESIGNAL_APP_ID')
    return false
  }

  // 1) Load SDK
  const loaded = await loadOneSignalSDK()
  if (!loaded || !window.OneSignal) {
    toast.error('Không thể tải OneSignal SDK')
    return false
  }

  // 2) Wait for OneSignal to be ready and initialize
  const initCompleted = await new Promise<boolean>((resolve) => {
    ensureDeferred()
    window.OneSignalDeferred!.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
        })
        console.log('[OneSignal] init done')
        resolve(true)
      } catch (e) {
        console.error('[OneSignal] init error', e)
        toast.error('Khởi tạo OneSignal thất bại')
        resolve(false)
      }
    })
  })

  if (!initCompleted) {
    return false
  }

  // 3) Attach listener for subscription changes
  if (!isListenerAttached) {
    isListenerAttached = true
    window.OneSignalDeferred!.push((OneSignal: any) => {
      try {
        OneSignal?.User?.PushSubscription?.addEventListener('change', async (ev: any) => {
          console.log('[OneSignal] PushSubscription.change:', ev?.current)
          if (ev?.current?.id && ev?.current?.optedIn) {
            await sendPlayerIdIfNeeded()
          }
        })
      } catch (e) {
        console.error('[OneSignal] attach change listener error', e)
      }
    })
  }

  // 4) Request notification permission
  const granted = await new Promise<boolean>((resolve) => {
    window.OneSignalDeferred!.push(async (OneSignal: any) => {
      try {
        const ok = await OneSignal?.Notifications?.requestPermission()
        resolve(!!ok)
      } catch {
        resolve(false)
      }
    })
  })

  console.log('[OneSignal] permission granted:', granted)

  if (!granted) {
    toast.warning('Bạn chưa cho phép nhận thông báo')
    return false
  }

  // 5) Wait a bit for subscription to be established, then send player ID
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await sendPlayerIdIfNeeded()

  return true
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  // First check browser notification permission
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'denied') {
      return false
    }
    if (Notification.permission !== 'granted') {
      return false
    }
  }

  // If OneSignal SDK is not loaded, return based on browser permission
  if (!window.OneSignal) {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    )
  }

  // If OneSignal SDK is loaded, check subscription status
  return new Promise((resolve) => {
    const checkStatus = (OneSignal: any) => {
      try {
        // Check browser notification permission via OneSignal
        const browserPermission = OneSignal?.Notifications?.permission
        if (browserPermission !== 'granted') {
          console.log('[OneSignal] Browser permission not granted:', browserPermission)
          resolve(false)
          return
        }

        // Check OneSignal push subscription status
        const pushSubscription = OneSignal?.User?.PushSubscription
        if (!pushSubscription) {
          console.log('[OneSignal] PushSubscription not available')
          resolve(false)
          return
        }

        // Check if user has opted in and has a valid subscription ID
        const isOptedIn = pushSubscription.optedIn === true
        const hasSubscriptionId = !!pushSubscription.id

        const isSubscribed = isOptedIn && hasSubscriptionId
        console.log('[OneSignal] Subscription status:', {
          isOptedIn,
          hasSubscriptionId,
          isSubscribed,
          playerId: pushSubscription.id,
          permission: browserPermission,
        })

        resolve(isSubscribed)
      } catch (error) {
        console.error('[OneSignal] Error checking subscription status:', error)
        resolve(false)
      }
    }

    // If OneSignal is already available, check immediately
    if (window.OneSignal) {
      checkStatus(window.OneSignal)
      return
    }

    // If OneSignal is not loaded yet, use deferred pattern
    ensureDeferred()
    window.OneSignalDeferred!.push((OneSignal: any) => {
      checkStatus(OneSignal)
    })
  })
}
