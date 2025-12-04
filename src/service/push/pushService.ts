import { API_ENDPOINT } from '@/common/apiEndpoint'

// Helper: convert Base64 URL-safe string to Uint8Array (for VAPID public key)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Trình duyệt không hỗ trợ Notification API')
  }

  const current = Notification.permission
  if (current !== 'default') return current

  return await Notification.requestPermission()
}

/**
 * Đăng ký push subscription với service worker hiện tại
 * - Trả về object subscription để gửi lên backend
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Trình duyệt không hỗ trợ Service Worker')
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    throw new Error('Người dùng chưa cho phép thông báo')
  }

  const registration = await navigator.serviceWorker.ready

  // Tránh subscribe trùng
  const existingSubscription = await registration.pushManager.getSubscription()
  if (existingSubscription) {
    return existingSubscription
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('Thiếu VITE_VAPID_PUBLIC_KEY trong env')
  }

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  // Gửi subscription lên backend lưu lại
  await fetch(API_ENDPOINT.NOTIFICATION_SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newSubscription),
  })

  return newSubscription
}

/**
 * Gửi yêu cầu backend bắn thử 1 push đến subscription hiện tại (tuỳ backend implement)
 */
export async function triggerTestPush() {
  await fetch(API_ENDPOINT.NOTIFICATION_TEST_PUSH, {
    method: 'POST',
  })
}
