import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Bell } from 'lucide-react'
import { useGetNotiBell } from '@/hooks/notifications/useGetNotiBell'
import { useNavigate } from 'react-router'
import { useSeenNotification } from '@/hooks/notifications/useSeenNotification'
import dayjs from 'dayjs'

export default function BellNotification() {
  const navigate = useNavigate()
  const { notifications } = useGetNotiBell()
  const { seenNotificationMutation } = useSeenNotification()

  const unreadCount = notifications?.filter((n: any) => !n.seen)?.length

  const handleClickNoti = (taskId: string) => {
    navigate(`/tasks/${taskId}`)
  }

  const handleSeenNoti = (notiId: number) => {
    seenNotificationMutation.mutate({ notiId, seen: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 rounded-2xl shadow-2xl bg-white border-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có thông báo</p>
          ) : (
            notifications?.map((noti: any) => (
              <DropdownMenuItem
                key={noti.id}
                onClick={() => {
                  handleSeenNoti(noti.id)
                  handleClickNoti(noti.extraId)
                }}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0
              ${!noti.seen ? 'bg-blue-50/30' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={noti.trigger.avatar} />
                    <AvatarFallback>{noti.trigger.name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {noti.message.split(noti.trigger.name).reduce(
                      (acc: any, part: any, i: any) =>
                        i === 0
                          ? [...acc, part]
                          : [
                              ...acc,
                              <span
                                key={i}
                                className="font-semibold hover:underline cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation() // 🔥 chặn click lan lên DropdownMenuItem
                                  navigate(`/profile/${noti.trigger.id}`)
                                }}
                              >
                                {noti.trigger.name}
                              </span>,
                              part,
                            ],
                      [] as React.ReactNode[]
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">{dayjs(noti.createdTime).fromNow()}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full rounded-none py-6 text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => navigate('/notifications')} // thay bằng route phù hợp
          >
            Xem thông báo cũ hơn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
