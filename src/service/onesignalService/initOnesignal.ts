import OneSignal from 'react-onesignal'

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

function loadOneSignalSDK() {
  if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) return

  const script = document.createElement('script')
  script.src = ONE_SIGNAL_SDK_URL
  script.async = true
  document.body.appendChild(script)
}

export async function requestNotificationPermission() {
  const permission = await (OneSignal.Notifications as any).getPermissionStatus()

  console.log('Permission:', permission)

  if (permission === 'granted') {
    console.log('Đã được cấp quyền')
    return true
  }

  if (permission === 'denied') {
    console.log('Người dùng đã chặn thông báo')
    return false
  }

  const result = await OneSignal.Notifications.requestPermission()

  if ((result as any) === 'granted') {
    console.log('User đã Allow')
    return true
  }

  console.log('User đã Block hoặc tắt popup')
  return false
}

export async function initOneSignal() {
  if (typeof window === 'undefined') return
  await requestNotificationPermission()

  // if (resultPermission) {
  //   return
  // }

  loadOneSignalSDK()

  await OneSignal.init({
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: '/OneSignalSDKWorker.js',
  })
}
