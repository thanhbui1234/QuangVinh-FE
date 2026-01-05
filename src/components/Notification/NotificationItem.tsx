import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNotificationNavigation } from '@/hooks/useNotificationNavigation'
import { NotificationContent } from './NotificationContent'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  noti: any
  onSeen?: (id: number) => void
  notiType?: string | number
}

export const NotificationItem = ({ noti, onSeen, notiType }: NotificationItemProps) => {
  const { handleNavigate } = useNotificationNavigation({ noti, onSeen, notiType })

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        'flex relative items-start gap-4 px-6 py-4 cursor-pointer border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors',
        !noti.seen && 'bg-blue-50/80 dark:bg-blue-950/30'
      )}
    >
      {!noti.seen && (
        <span
          className="absolute right-4 top-[30%] -translate-y-1/2
      h-2.5 w-2.5 rounded-full bg-blue-500"
        />
      )}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={noti.trigger?.avatar} />
        <AvatarFallback>{noti.trigger?.name?.[0] || '?'}</AvatarFallback>
      </Avatar>

      <NotificationContent noti={noti} />
    </div>
  )
}
