import { registerPlayerIdToDashboard } from './onesignalService'

declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(OneSignal: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

export async function initOneSignal() {
  if (typeof window === 'undefined') return

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId) {
    console.warn('VITE_ONESIGNAL_APP_ID is missing, skip OneSignal init')
    return
  }

  if (window.OneSignal?.initialized) {
    console.log('OneSignal already initialized')
    return
  }

  if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) {
    await waitForOneSignal()
    return
  }

  window.OneSignalDeferred = window.OneSignalDeferred || []

  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      })

      console.log('OneSignal initialized successfully')

      // Lắng nghe khi subscription thay đổi để tự động gửi Player ID
      OneSignal.User.PushSubscription.addEventListener('change', async () => {
        try {
          const playerId = await OneSignal.User.PushSubscription.id
          if (playerId) {
            console.log('OneSignal subscription changed, Player ID:', playerId)
            await registerPlayerIdToDashboard()
          }
        } catch (err) {
          console.warn('Error handling subscription change:', err)
        }
      })

      const hasPermission = OneSignal.Notifications.permission
      console.log('Current notification permission:', hasPermission)

      if (hasPermission) {
        console.log('Notification permission already granted')
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          const userId = await OneSignal.User.PushSubscription.id
          console.log('OneSignal Player ID:', userId)

          const user = await OneSignal.User.id
          console.log('OneSignal User ID:', user)

          // Tự động gửi Player ID lên dashboard nếu user đã đăng nhập
          if (userId) {
            await registerPlayerIdToDashboard()
          }
        } catch (err) {
          console.warn('Could not get Player ID yet:', err)
        }
      }
    } catch (err) {
      console.error('OneSignal initialization failed:', err)
    }
  })

  const script = document.createElement('script')
  script.src = ONE_SIGNAL_SDK_URL
  script.async = true

  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load OneSignal SDK'))
    document.head.appendChild(script)
  })

  await waitForOneSignal()
}

async function waitForOneSignal(maxAttempts = 50, delay = 100): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.OneSignal) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  throw new Error('OneSignal SDK failed to load')
}

export async function getOneSignalPermissionStatus(): Promise<
  'default' | 'granted' | 'denied' | null
> {
  const OneSignal = window.OneSignal
  if (!OneSignal?.Notifications) {
    return null
  }
  try {
    if ('Notification' in window) {
      return Notification.permission as 'default' | 'granted' | 'denied'
    }
    const hasPermission = OneSignal.Notifications.permission
    return hasPermission ? 'granted' : 'default'
  } catch (err) {
    console.error('Error checking notification permission:', err)
    return null
  }
}

export async function requestOneSignalPermission(): Promise<'default' | 'granted' | 'denied'> {
  const OneSignal = window.OneSignal
  if (!OneSignal?.Notifications) {
    throw new Error('OneSignal SDK chưa sẵn sàng')
  }
  if ('Notification' in window && Notification.requestPermission) {
    const permission = await Notification.requestPermission()
    return permission as 'default' | 'granted' | 'denied'
  }

  const result = await OneSignal.Notifications.requestPermission()
  if (typeof result === 'boolean') {
    return result ? 'granted' : 'denied'
  }
  return result as 'default' | 'granted' | 'denied'
}

export async function requestOneSignalPermissionIfNeeded(): Promise<boolean> {
  try {
    const currentPermission = await getOneSignalPermissionStatus()

    if (currentPermission === 'granted') {
      console.log('Notification permission already granted')
      return true
    }

    if (currentPermission === 'denied') {
      console.log('Notification permission was previously denied')
      return false
    }

    console.log('Requesting notification permission...')
    const permission = await requestOneSignalPermission()

    if (permission === 'granted') {
      console.log('Notification permission granted')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        const OneSignal = window.OneSignal
        const userId = await OneSignal.User.PushSubscription.id
        console.log('OneSignal Player ID:', userId)

        if (userId) {
          await registerPlayerIdToDashboard()
        }
      } catch (err) {
        console.warn('Could not get Player ID yet:', err)
      }

      return true
    } else {
      console.log('Notification permission not granted:', permission)
      return false
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err)
    return false
  }
}
