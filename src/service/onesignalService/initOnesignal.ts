declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(OneSignal: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

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

export async function initOneSignal() {
  if (typeof window === 'undefined') return

  loadOneSignalSDK()

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    })

    console.log('OneSignal init success')

    const granted = await requestNotificationPermission()
    console.log('Permission granted?', granted)

    const playerId = await OneSignal.User.Push.getSubscriptionId()
    console.log('playerId:', playerId)
  })
}
