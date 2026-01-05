import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useNavigate } from 'react-router'
import { useCallback } from 'react'

dayjs.extend(relativeTime)

interface NotificationContentProps {
  noti: any
}

export const NotificationContent = ({ noti }: NotificationContentProps) => {
  const navigate = useNavigate()

  const handleProfileClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigate(`/profile/${noti.trigger.id}`)
    },
    [navigate, noti.trigger.id]
  )

  // Split message by user name to make it clickable
  const renderMessage = () => {
    const parts = noti.message.split(noti.trigger.name)
    return parts.reduce((acc: any[], part: string, i: number) => {
      if (i === 0) {
        return [part]
      }
      return [
        ...acc,
        <span
          key={i}
          className="font-semibold hover:underline cursor-pointer"
          onClick={handleProfileClick}
        >
          {noti.trigger.name}
        </span>,
        part,
      ]
    }, [])
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground leading-relaxed">{renderMessage()}</p>
      <p className="text-xs text-muted-foreground mt-1">{dayjs(noti.createdTime).fromNow()}</p>
    </div>
  )
}
