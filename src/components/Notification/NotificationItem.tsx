import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router'

interface NotificationItemProps {
  noti: any
  onSeen?: (id: number) => void
}

export const NotificationItem = ({ noti, onSeen }: NotificationItemProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    onSeen?.(noti.id)
    navigate(`/tasks/${noti.extraId}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`flex relative items-start gap-4 px-6 py-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50
        ${!noti.seen ? 'bg-blue-50/80' : ''}`}
    >
      {!noti.seen && (
        <span
          className="absolute right-4 top-[30%] -translate-y-1/2
      h-2.5 w-2.5 rounded-full bg-blue-500"
        />
      )}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={noti.trigger.avatar} />
        <AvatarFallback>{noti.trigger.name[0]}</AvatarFallback>
      </Avatar>

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
                      className="font-semibold hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/profile/${noti.trigger.id}`)
                      }}
                    >
                      {noti.trigger.name}
                    </span>,
                    part,
                  ],
            []
          )}
        </p>

        <p className="text-xs text-gray-500 mt-1">{dayjs(noti.createdTime).fromNow()}</p>
      </div>
    </div>
  )
}
