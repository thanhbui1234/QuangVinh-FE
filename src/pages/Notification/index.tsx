import { NotificationItem } from '@/components/Notification/NotificationItem'
import { useGetNotificationsPage } from '@/hooks/notifications/useGetNotificationsPage'
import { useSeenNotification } from '@/hooks/notifications/useSeenNotification'
import { useLoadMoreNotifications } from '@/hooks/notifications/useLoadMoreNotifications'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export const NotificationPage = () => {
  const { notifications: initialNotifications, isFetching } = useGetNotificationsPage()
  const { seenNotificationMutation } = useSeenNotification()
  const { loadMoreMutation } = useLoadMoreNotifications()
  const [allNotifications, setAllNotifications] = useState<any[]>([])
  const [lastNotiId, setLastNotiId] = useState<number | null>(null)

  // Cập nhật danh sách khi có notifications mới từ initial load
  useEffect(() => {
    if (initialNotifications && initialNotifications.length > 0) {
      setAllNotifications(initialNotifications)
      // Lấy ID của notification cuối cùng
      const lastNoti = initialNotifications[initialNotifications.length - 1]
      setLastNotiId(lastNoti?.id || null)
    } else if (initialNotifications && initialNotifications.length === 0) {
      setAllNotifications([])
      setLastNotiId(null)
    }
  }, [initialNotifications])

  const handleLoadMore = () => {
    if (lastNotiId === null) return

    loadMoreMutation.mutate(
      { fromNotiId: lastNotiId, size: 5 },
      {
        onSuccess: (newNotifications) => {
          if (newNotifications && newNotifications.length > 0) {
            // Thêm notifications mới vào danh sách hiện tại
            setAllNotifications((prev) => [...prev, ...newNotifications])
            // Cập nhật lastNotiId với ID của notification cuối cùng trong batch mới
            const lastNewNoti = newNotifications[newNotifications.length - 1]
            setLastNotiId(lastNewNoti?.id || null)
          } else {
            // Không còn thông báo nào nữa
            setLastNotiId(null)
          }
        },
      }
    )
  }

  const hasMoreNotifications = lastNotiId !== null && !loadMoreMutation.isPending
  const isLoadingMore = loadMoreMutation.isPending

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <PageBreadcrumb />
      <h1 className="text-3xl font-bold mb-6">Tất cả thông báo</h1>

      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow">
        {isFetching && allNotifications.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tải...</p>
        ) : allNotifications.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Không có thông báo</p>
        ) : (
          <>
            {allNotifications.map((noti: any) => (
              <NotificationItem
                key={noti.id}
                noti={noti}
                onSeen={(id) => seenNotificationMutation.mutate({ notiId: id, seen: true })}
                notiType={noti.notiType || noti.type}
              />
            ))}
            {hasMoreNotifications && (
              <div className="px-6 py-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Đang tải...' : 'Xem thêm'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
