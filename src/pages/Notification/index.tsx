import { NotificationItem } from '@/components/Notification/NotificationItem'
import { useGetNotiBell } from '@/hooks/notifications/useGetNotiBell'
import { useSeenNotification } from '@/hooks/notifications/useSeenNotification'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export const NotificationPage = () => {
  const { notifications } = useGetNotiBell()
  const { seenNotificationMutation } = useSeenNotification()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <PageBreadcrumb />
      <h1 className="text-3xl font-bold mb-6">Tất cả thông báo</h1>

      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow">
        {notifications?.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Không có thông báo</p>
        ) : (
          notifications?.map((noti: any) => (
            <NotificationItem
              key={noti.id}
              noti={noti}
              onSeen={(id) => seenNotificationMutation.mutate({ notiId: id, seen: true })}
              notiType={noti.type}
            />
          ))
        )}
      </div>
    </div>
  )
}
