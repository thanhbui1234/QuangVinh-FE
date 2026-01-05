import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router'
import { NotiType } from '@/constants'
import { useIsMobile } from '@/hooks/use-mobile'

interface NotificationItemProps {
  noti: any
  onSeen?: (id: number) => void
  notiType?: string | number
}

export const NotificationItem = ({ noti, onSeen, notiType }: NotificationItemProps) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Get notiType from prop or from noti object
  const currentNotiType = notiType || noti.notiType || noti.type

  const handleClick = () => {
    onSeen?.(noti.id)

    const type = Number(currentNotiType)

    // Types 5,6: Navigate to group details (using extraId as groupId)
    if (type === NotiType.INVITE_MEMBER_GROUP || type === NotiType.REMOVE_MEMBER_GROUP) {
      const groupId = noti.extraId
      if (groupId) {
        navigate(`/assignments/${groupId}`)
      }
      return
    }

    // Types 8,9,10: Navigate to leaves page and show modal/sheet
    if (
      type === NotiType.CREATE_ABSENCE ||
      type === NotiType.APPROVE_ABSENCE ||
      type === NotiType.REJECT_ABSENCE
    ) {
      const absenceRequestId = noti.objectId
      if (absenceRequestId) {
        // Navigate to leaves page with query param
        const leavesPath = isMobile ? '/mobile/leaves' : '/personnel/leaves'
        navigate(`${leavesPath}?absenceRequestId=${absenceRequestId}`)
      }
      return
    }

    // Default: navigate to task (existing behavior)
    if (noti.extraId) {
      navigate(`/tasks/${noti.extraId}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex relative items-start gap-4 px-6 py-4 cursor-pointer border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors
        ${!noti.seen ? 'bg-blue-50/80 dark:bg-blue-950/30' : ''}`}
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
        <p className="text-sm text-foreground leading-relaxed">
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

        <p className="text-xs text-muted-foreground mt-1">{dayjs(noti.createdTime).fromNow()}</p>
      </div>
    </div>
  )
}
