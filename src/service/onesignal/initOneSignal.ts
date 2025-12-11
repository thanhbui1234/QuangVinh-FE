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
  try {
    let attempts = 0
    while (!window.OneSignal && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    const OneSignal = window.OneSignal
    if (!OneSignal?.Notifications) {
      if ('Notification' in window) {
        return Notification.permission as 'default' | 'granted' | 'denied'
      }
      return null
    }

    try {
      const permission = OneSignal.Notifications.permission

      if (typeof permission === 'boolean') {
        return permission ? 'granted' : 'default'
      }

      if (typeof permission === 'string') {
        const normalized = permission.toLowerCase()
        if (normalized === 'granted') return 'granted'
        if (normalized === 'denied') return 'denied'
        return 'default'
      }

      if ('Notification' in window) {
        return Notification.permission as 'default' | 'granted' | 'denied'
      }

      return 'default'
    } catch (err) {
      if ('Notification' in window) {
        return Notification.permission as 'default' | 'granted' | 'denied'
      }
      throw err
    }
  } catch (err) {
    console.error('Error checking notification permission:', err)
    if ('Notification' in window) {
      return Notification.permission as 'default' | 'granted' | 'denied'
    }
    return null
  }
}

export async function requestOneSignalPermission(): Promise<'default' | 'granted' | 'denied'> {
  await waitForOneSignal()

  const OneSignal = window.OneSignal
  if (!OneSignal?.Notifications) {
    throw new Error('OneSignal SDK chưa sẵn sàng')
  }

  try {
    const result = await OneSignal.Notifications.requestPermission()

    if (typeof result === 'boolean') {
      return result ? 'granted' : 'denied'
    }

    if (typeof result === 'string') {
      const normalized = result.toLowerCase()
      if (normalized === 'granted') return 'granted'
      if (normalized === 'denied') return 'denied'
      return 'default'
    }

    if ('Notification' in window && Notification.requestPermission) {
      const permission = await Notification.requestPermission()
      return permission as 'default' | 'granted' | 'denied'
    }

    return 'default'
  } catch (error) {
    console.error('Error requesting OneSignal permission:', error)
    if ('Notification' in window && Notification.requestPermission) {
      try {
        const permission = await Notification.requestPermission()
        return permission as 'default' | 'granted' | 'denied'
      } catch (err) {
        console.error('Error using browser Notification API:', err)
        return 'denied'
      }
    }
    throw error
  }
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
