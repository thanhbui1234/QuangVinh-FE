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

  ensureDeferred()
  window.OneSignalDeferred!.push(async (OneSignal: any) => {
    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      })
      console.log('[OneSignal] init done')
    } catch (e) {
      console.error('[OneSignal] init error', e)
      toast.error('Khởi tạo OneSignal thất bại')
    }
  })

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

  await sendPlayerIdIfNeeded()
  return true
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    ensureDeferred()
    window.OneSignalDeferred!.push((OneSignal: any) => {
      try {
        const hasPerm: boolean = !!OneSignal?.Notifications?.permission
        const playerId: string | null = OneSignal?.User?.PushSubscription?.id ?? null
        resolve(!!hasPerm && !!playerId)
      } catch {
        resolve(false)
      }
    })
  })
}
