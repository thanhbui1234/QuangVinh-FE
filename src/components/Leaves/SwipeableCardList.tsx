import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, Clock3, Trash2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type LeavesListDataResponse, StatusLeaves } from '@/types/Leave.ts'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

type SwipeableCardListProps = {
  items: LeavesListDataResponse[]
  onViewDetails: (request: LeavesListDataResponse) => void
  onDelete?: (request: LeavesListDataResponse) => void
  canEditOrDelete?: (request: LeavesListDataResponse) => boolean
  canApprove?: boolean
  onActionClick?: (
    id: number,
    action: 'approve' | 'reject',
    request?: LeavesListDataResponse
  ) => void
  loading?: boolean
}

function getStatusConfig(status: (typeof StatusLeaves)[keyof typeof StatusLeaves]) {
  switch (status) {
    case StatusLeaves.APPROVED:
      return {
        label: 'Đã duyệt',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      }
    case StatusLeaves.REJECTED:
      return {
        label: 'Từ chối',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      }
    case StatusLeaves.PENDING:
    default:
      return {
        label: 'Chờ duyệt',
        icon: Clock3,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
      }
  }
}

function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Hôm nay'
  if (isYesterday(date)) return 'Hôm qua'
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

type SwipeableCardProps = {
  item: LeavesListDataResponse
  onViewDetails: () => void
  onDelete?: () => void
  canDelete: boolean
  canApprove?: boolean
  onActionClick?: (
    id: number,
    action: 'approve' | 'reject',
    request?: LeavesListDataResponse
  ) => void
}

function SwipeableCard({
  item,
  onViewDetails,
  onDelete,
  canDelete,
  canApprove = false,
  onActionClick,
}: SwipeableCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const x = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Transform for delete button visibility
  const deleteButtonOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
  const deleteButtonScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5])

  const date = parseISO(item.offFrom)
  const time = format(date, 'HH:mm')
  const relativeDate = formatRelativeDate(date)
  const statusConfig = getStatusConfig(item.status)
  const StatusIcon = statusConfig.icon

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -80
    if (info.offset.x < threshold && canDelete) {
      setIsRevealed(true)
    } else {
      setIsRevealed(false)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      setIsRevealed(false)
    }
  }

  return (
    <div className="relative">
      {/* Delete Button (revealed on swipe) */}
      {canDelete && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4"
          style={{
            opacity: deleteButtonOpacity,
            scale: deleteButtonScale,
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white h-full px-6 rounded-2xl"
          >
            <Trash2 className="size-5" />
          </Button>
        </motion.div>
      )}

      {/* Swipeable Card */}
      <motion.div
        ref={cardRef}
        drag={canDelete ? 'x' : false}
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{ x: isRevealed ? -100 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 bg-card',
          'active:scale-[0.98] transition-transform'
        )}
        onClick={() => {
          if (!isRevealed) {
            onViewDetails()
          } else {
            setIsRevealed(false)
          }
        }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5" />

        {/* Content */}
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn('p-2.5 rounded-xl shrink-0', statusConfig.bgColor)}>
              <Clock className={cn('size-5', statusConfig.color)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Time and Date */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-bold">{time}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{relativeDate}</span>
              </div>

              {/* Reason */}
              <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed mb-3">
                {item.reason}
              </p>

              {/* Status Badge and Action Buttons */}
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                    statusConfig.bgColor,
                    statusConfig.color
                  )}
                >
                  <StatusIcon className="size-3.5" />
                  {statusConfig.label}
                </div>

                {/* Approve/Reject buttons for managers */}
                {item.status === StatusLeaves.PENDING && canApprove && onActionClick && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onActionClick(item.id, 'reject', item)
                      }}
                      className="h-7 px-2 hover:bg-red-100 hover:text-red-600"
                    >
                      <XCircle className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onActionClick(item.id, 'approve', item)
                      }}
                      className="h-7 px-2 hover:bg-green-100 hover:text-green-600"
                    >
                      <CheckCircle2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="size-5 text-muted-foreground shrink-0 mt-1" />
          </div>
        </div>

        {/* Swipe indicator line (subtle hint) */}
        {canDelete && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted rounded-full opacity-30" />
        )}
      </motion.div>
    </div>
  )
}

export function SwipeableCardList({
  items,
  onViewDetails,
  onDelete,
  canEditOrDelete,
  canApprove = false,
  onActionClick,
  loading,
}: SwipeableCardListProps) {
  if (loading) {
    return (
      <div className="space-y-3 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="p-6 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 mb-4">
          <Clock className="size-12 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có đơn đi muộn nào</h3>
        <p className="text-muted-foreground">Danh sách đơn đi muộn sẽ hiển thị tại đây</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3 px-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SwipeableCard
            item={item}
            onViewDetails={() => onViewDetails(item)}
            onDelete={onDelete ? () => onDelete(item) : undefined}
            canDelete={canEditOrDelete?.(item) ?? false}
            canApprove={canApprove}
            onActionClick={onActionClick}
          />
        </motion.div>
      ))}
    </div>
  )
}
