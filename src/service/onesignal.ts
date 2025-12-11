import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { isAuthenticated } from '@/utils/auth'

declare global {
  interface Window {
    OneSignal?: any
  }
}

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js'

// Khởi tạo OneSignal
export async function initOneSignal() {
  if (typeof window === 'undefined') return

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID
  if (!appId) {
    console.warn('VITE_ONESIGNAL_APP_ID is missing, skip OneSignal init')
    return
  }

  // Nếu đã khởi tạo rồi thì return
  if (window.OneSignal?.initialized) {
    return
  }

  // Nếu script đã được load rồi thì đợi SDK sẵn sàng
  if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) {
    await waitForOneSignal()
    return
  }

  // Load SDK script
  const script = document.createElement('script')
  script.src = ONE_SIGNAL_SDK_URL
  script.async = true
  document.head.appendChild(script)

  await waitForOneSignal()

  // Khởi tạo OneSignal
  try {
    await window.OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: '/onesignal/OneSignalSDKWorker.js',
    })

    console.log('OneSignal initialized successfully')

    // Lắng nghe khi subscription thay đổi để tự động gửi Player ID
    window.OneSignal.User.PushSubscription.addEventListener('change', async () => {
      await registerPlayerId()
    })

    // Nếu đã có permission thì đăng ký Player ID ngay
    if (window.OneSignal.Notifications.permission === 'granted') {
      await registerPlayerId()
    }
  } catch (err) {
    console.error('OneSignal initialization failed:', err)
  }
}

// Đợi OneSignal SDK load xong
async function waitForOneSignal(maxAttempts = 50, delay = 100): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.OneSignal) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  throw new Error('OneSignal SDK failed to load')
}

// Lấy Player ID
export async function getPlayerId(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return null
  }

  try {
    return await window.OneSignal.User.PushSubscription.id
  } catch (error) {
    console.error('Error getting Player ID:', error)
    return null
  }
}

// Yêu cầu quyền thông báo
export async function requestPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return false
  }

  try {
    const permission = await window.OneSignal.Notifications.requestPermission()
    if (permission === 'granted') {
      await registerPlayerId()
      return true
    }
    return false
  } catch (error) {
    console.error('Error requesting permission:', error)
    return false
  }
}

// Đăng ký Player ID lên dashboard
async function registerPlayerId(): Promise<void> {
  if (!isAuthenticated()) {
    return
  }

  const playerId = await getPlayerId()
  if (!playerId) {
    return
  }

  try {
    await POST(API_ENDPOINT.NOTIFICATION_SUBSCRIBE, { playerId })
    console.log('Player ID registered:', playerId)
  } catch (error) {
    console.error('Error registering Player ID:', error)
  }
}

// Export function để đăng ký Player ID từ bên ngoài
export async function registerPlayerIdToDashboard(): Promise<void> {
  await registerPlayerId()
}
