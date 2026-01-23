import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, Clock3, Edit2, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type LeavesListDataResponse, StatusLeaves } from '@/types/Leave.ts'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import 'dayjs/locale/vi'

dayjs.extend(isToday)
dayjs.extend(isYesterday)

type LateArrivalTimelineProps = {
  data: LeavesListDataResponse[]
  onViewDetails: (request: LeavesListDataResponse) => void
  onEdit?: (request: LeavesListDataResponse) => void
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
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
      }
    case StatusLeaves.REJECTED:
      return {
        label: 'Từ chối',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
      }
    case StatusLeaves.PENDING:
    default:
      return {
        label: 'Chờ duyệt',
        icon: Clock3,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
      }
  }
}

function formatDateGroup(date: dayjs.Dayjs): string {
  if (date.isToday()) return 'Hôm nay'
  if (date.isYesterday()) return 'Hôm qua'
  return date.locale('vi').format('dddd, DD/MM/YYYY')
}

function groupByDate(data: LeavesListDataResponse[]): Map<string, LeavesListDataResponse[]> {
  const groups = new Map<string, LeavesListDataResponse[]>()

  data.forEach((item) => {
    const date = dayjs(item.offFrom)
    const dateKey = date.format('YYYY-MM-DD')
    const group = groups.get(dateKey) || []
    group.push(item)
    groups.set(dateKey, group)
  })

  // Sort groups by date (newest first)
  return new Map([...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])))
}

export function LateArrivalTimeline({
  data,
  onViewDetails,
  onEdit,
  onDelete,
  canEditOrDelete,
  canApprove = false,
  onActionClick,
  loading,
}: LateArrivalTimelineProps) {
  const groupedData = groupByDate(data)

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-2xl" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="p-6 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 mb-4">
          <Clock className="size-12 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có đơn đi muộn nào</h3>
        <p className="text-muted-foreground">Danh sách đơn đi muộn sẽ hiển thị tại đây</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {Array.from(groupedData.entries()).map(([dateKey, items], groupIndex) => {
          const date = dayjs(items[0].offFrom)
          const dateLabel = formatDateGroup(date)

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="space-y-4"
            >
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <motion.h3
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-3 py-1.5 bg-muted/50 rounded-full"
                >
                  {dateLabel}
                </motion.h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const date = dayjs(item.offFrom)
                  const time = date.format('HH:mm')
                  const statusConfig = getStatusConfig(item.status)
                  const StatusIcon = statusConfig.icon
                  const canEdit = canEditOrDelete?.(item)

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border-2 bg-card',
                        'transition-all duration-300',
                        'hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700',
                        statusConfig.borderColor
                      )}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="relative p-5">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2.5 rounded-xl', statusConfig.bgColor)}>
                              <Clock className={cn('size-5', statusConfig.color)} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold">{time}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                  {date.format('DD/MM/YYYY')}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                                  statusConfig.bgColor,
                                  statusConfig.color,
                                  statusConfig.borderColor
                                )}
                              >
                                <StatusIcon className="size-3.5" />
                                {statusConfig.label}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Approve/Reject buttons for managers */}
                            {item.status === StatusLeaves.PENDING &&
                              canApprove &&
                              onActionClick && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onActionClick(item.id, 'reject', item)
                                    }}
                                    className="h-9 px-3 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                  >
                                    <XCircle className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onActionClick(item.id, 'approve', item)
                                    }}
                                    className="h-9 px-3 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                                  >
                                    <CheckCircle2 className="size-4" />
                                  </Button>
                                </>
                              )}
                            {/* Edit/Delete buttons for creator */}
                            {canEdit && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit?.(item)
                                  }}
                                  className="h-9 px-3 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete?.(item)
                                  }}
                                  className="h-9 px-3 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.reason}
                          </p>
                        </div>

                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="w-full h-10 rounded-xl font-semibold group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                        >
                          <Eye className="size-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </div>

                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
