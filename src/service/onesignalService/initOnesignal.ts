declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(OneSignal: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

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

export async function initOneSignal(): Promise<boolean> {
  if (typeof window === 'undefined') return false

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

          const granted = await requestNotificationPermission()
          console.log('Permission granted?', granted)

          if (!granted) {
            // Allow re-try when user toggles again after granting permission in browser settings.
            initPromise = null
          }

          const playerId = await OneSignal.User.Push.getSubscriptionId()
          console.log('playerId:', playerId)

          resolve(granted)
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
