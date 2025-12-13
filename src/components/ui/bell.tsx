import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCheckNotiUnread } from '@/hooks/notifications/useCheckNotiUnread'

/**
 * Bell Notification Component
 *
 * Features:
 * - Hiển thị badge khi có notification chưa đọc
 * - Real-time notification qua Socket.IO (auto-handled by useNotifications in WebLayout)
 * - Dropdown hiển thị preview notifications
 */
export default function BellNotification() {
  // const { isConnected, hasNewNoti } = useSocketContext()
  const { isUnread, notifications } = useCheckNotiUnread()

  // Show badge nếu có unread hoặc có notification mới từ socket
  const showBadge = isUnread
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full cursor-pointer"
          title={isUnread ? 'Notifications' : 'Reconnecting...'}
        >
          <BellIcon className="h-5 w-5 rounded-full" />

          {/* Badge hiển thị số notification chưa đọc */}
          {showBadge && unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="mb-2 text-lg font-medium">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />

        {/* Hiển thị danh sách notifications */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Không có thông báo nào</p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  !notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                  <BellIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View all link */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <a
              href="/notifications"
              className="block text-sm text-blue-600 hover:text-blue-700 text-center font-medium"
            >
              Xem tất cả →
            </a>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Helper function để format thời gian
function formatTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
