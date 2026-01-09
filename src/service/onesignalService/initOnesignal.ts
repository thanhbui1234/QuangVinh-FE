import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { toast } from 'sonner'

declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(os: any) => void>
  }
}

let isInitialized = false
let isListenerAttached = false
let lastSentPlayerId: string | null = null

function ensureDeferred() {
  window.OneSignalDeferred = window.OneSignalDeferred || []
}

/**
 * Initializes OneSignal globally. Should be called safely at App start.
 */
export async function runOneSignalInit(): Promise<void> {
  if (isInitialized) return
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID

  if (!appId) {
    console.error('[OneSignal] Missing VITE_ONESIGNAL_APP_ID')
    return
  }

  ensureDeferred()

  window.OneSignalDeferred!.push(async (OneSignal: any) => {
    try {
      if (!isInitialized) {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          // Prevent auto-prompting; we want to trigger it via UI toggle
          promptOptions: {
            slidedown: {
              prompts: [],
            },
          },
        })
        isInitialized = true
        console.log('[OneSignal] Initialized')
      }

      // Add listener for subscription changes to sync with backend
      if (!isListenerAttached) {
        isListenerAttached = true
        OneSignal.User.PushSubscription.addEventListener('change', async (ev: any) => {
          console.log('[OneSignal] PushSubscription.change:', ev?.current)

          const current = ev?.current
          if (current?.id && current?.optedIn) {
            await sendPlayerIdIfNeeded(current.id)
          }
        })
      }
    } catch (e) {
      console.error('[OneSignal] Init error', e)
    }
  })
}

/**
 * Sends Player ID to backend if we have a valid one.
 */
async function sendPlayerIdIfNeeded(playerId: string) {
  try {
    // Only send if we have a real ID
    if (!playerId) return

    // Prevent duplicate calls for the same ID
    if (playerId === lastSentPlayerId) return
    lastSentPlayerId = playerId

    await POST(API_ENDPOINT.ADD_NOTI_PLAYER, { playerId })
    console.log('[OneSignal] Synced playerId:', playerId)
  } catch (error) {
    console.error('[OneSignal] Failed to sync playerId:', error)
  }
}

/**
 * Toggles subscription status (User Opt-in/Opt-out)
 * If not subscribed/permission not granted, it requests permission first.
 */
export async function setNotificationEnabled(enabled: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    ensureDeferred()
    window.OneSignalDeferred!.push(async (OneSignal: any) => {
      try {
        if (enabled) {
          // 1. Check/Request Permission
          const permission = OneSignal.Notifications.permission
          if (permission !== 'granted') {
            const granted = await OneSignal.Notifications.requestPermission()
            if (!granted) {
              toast.error('Bạn cần cấp quyền thông báo trong cài đặt trình duyệt/thiết bị.')
              resolve(false)
              return
            }
          }

          // 2. Opt In
          await OneSignal.User.PushSubscription.optIn()

          // 3. Sync ID immediately if possible
          const id = OneSignal.User.PushSubscription.id
          if (id) {
            await sendPlayerIdIfNeeded(id)
          }

          resolve(true)
        } else {
          // Disable: Opt Out
          await OneSignal.User.PushSubscription.optOut()
          resolve(false)
        }
      } catch (e) {
        console.error('[OneSignal] setNotificationEnabled error', e)
        resolve(false)
      }
    })
  })
}

/**
 * Checks if the user is currently subscribed and opted in.
 */
export async function getSubscriptionStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    ensureDeferred()
    window.OneSignalDeferred!.push((OneSignal: any) => {
      try {
        // Must be opted in AND have an ID (which implies permission granted)
        const optedIn = OneSignal.User.PushSubscription.optedIn
        const id = OneSignal.User.PushSubscription.id
        const permission = OneSignal.Notifications.permission

        const isActive = !!(optedIn && id && permission === 'granted')
        resolve(isActive)
      } catch (e) {
        resolve(false)
      }
    })
  })
}
