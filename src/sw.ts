/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any
}

// Bắt buộc cho chế độ injectManifest của vite-plugin-pwa
// Workbox sẽ tự inject danh sách asset vào self.__WB_MANIFEST khi build
precacheAndRoute(self.__WB_MANIFEST || [])

// Kết hợp PWA SW và OneSignal Web SDK v16 trong **cùng một service worker**
// Điều này đặc biệt quan trọng cho PWA trên iOS để OneSignal có thể tạo
// subscription và playerId đúng cách.
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')

// Không tự xử lý 'push' / 'notificationclick' nữa.
// Các sự kiện này sẽ do OneSignalSDK.sw.js quản lý, đảm bảo
// push hoạt động ổn định trên cả web lẫn PWA (kể cả iOS).
