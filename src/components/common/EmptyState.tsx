import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  className?: string
  action?: React.ReactNode
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu nào được chia sẻ với bạn.',
  className,
  action,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="max-w-[300px] text-muted-foreground mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
