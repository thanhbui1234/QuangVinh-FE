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

      const permission = await OneSignal.Notifications.requestPermission()
      console.log('Notification permission:', permission)

      if (permission === 'granted') {
        console.log('Notification permission granted')

        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          const userId = await OneSignal.User.PushSubscription.id
          console.log('OneSignal Player ID:', userId)

          const user = await OneSignal.User.id
          console.log('OneSignal User ID:', user)
        } catch (err) {
          console.warn('Could not get Player ID yet:', err)
        }
      } else {
        console.warn('Notification permission not granted:', permission)
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

export async function requestOneSignalPermission() {
  const OneSignal = window.OneSignal
  if (!OneSignal?.Notifications) {
    throw new Error('OneSignal SDK chưa sẵn sàng')
  }
  return OneSignal.Notifications.requestPermission()
}
