declare global {
  interface Window {
    OneSignal?: any
    OneSignalDeferred?: Array<(OneSignal: any) => void>
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

export function initOneSignal() {
  if (typeof window === 'undefined') return

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId) {
    console.warn('VITE_ONESIGNAL_APP_ID is missing, skip OneSignal init')
    return
  }

  if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) return

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
    })
    try {
      await OneSignal.Notifications.requestPermission()
    } catch (err) {
      console.warn('OneSignal permission request failed', err)
    }
  })

  const script = document.createElement('script')
  script.src = ONE_SIGNAL_SDK_URL
  script.async = true
  document.head.appendChild(script)
}

export async function requestOneSignalPermission() {
  const OneSignal = window.OneSignal
  if (!OneSignal?.Notifications) {
    throw new Error('OneSignal SDK chưa sẵn sàng')
  }
  return OneSignal.Notifications.requestPermission()
}
