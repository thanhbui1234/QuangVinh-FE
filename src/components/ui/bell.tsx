import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { useGetNotiBell } from '@/hooks/notifications/useGetNotiBell'
import { useSeenNotification } from '@/hooks/notifications/useSeenNotification'
import { useNavigate } from 'react-router'
import { NotificationItem } from '../Notification/NotificationItem'

export default function BellNotification() {
  const navigate = useNavigate()
  const { notifications } = useGetNotiBell()
  const { seenNotificationMutation } = useSeenNotification()

  const unreadCount = notifications?.filter((n: any) => !n.seen)?.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0 rounded-2xl">
        <div className="flex justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Thông báo</h2>
          <span
            onClick={() => navigate('/notifications')}
            className="text-sm text-blue-500 cursor-pointer"
          >
            Xem tất cả
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications?.map((noti: any) => (
            <NotificationItem
              key={noti.id}
              noti={noti}
              onSeen={(id) => seenNotificationMutation.mutate({ notiId: id, seen: true })}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
