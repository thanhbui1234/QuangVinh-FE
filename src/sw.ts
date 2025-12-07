/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any
}

// Bắt buộc cho chế độ injectManifest của vite-plugin-pwa
// Workbox sẽ tự inject danh sách asset vào self.__WB_MANIFEST khi build
precacheAndRoute(self.__WB_MANIFEST || [])

// Lắng nghe sự kiện push từ server
self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  const data = event.data.json
    ? event.data.json()
    : { title: 'Notification', body: event.data.text() }

  const title = data.title || 'Thông báo mới'
  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '',
    badge: data.badge || '',
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Click vào notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          if ('navigate' in client) {
            ;(client as WindowClient).navigate(url)
          }
          return
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
