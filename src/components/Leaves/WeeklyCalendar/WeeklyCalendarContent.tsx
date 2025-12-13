import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calculateWeekRange } from '@/utils/CommonUtils'
import useGetApprovedLeavesByTime from '@/hooks/leaves/useGetApprovedLeavesByTime'
import { getWeekDays, getLeaveDates } from './utils'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import BottomSheet from '@/components/ui/bottom-sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeaveUsersList } from './LeaveUsersList'

interface WeeklyCalendarContentProps {
  weekOffset: number
  onWeekOffsetChange: (offset: number) => void
  className?: string
  variant?: 'mobile' | 'web'
}

export function WeeklyCalendarContent({
  weekOffset,
  onWeekOffsetChange,
  className,
  variant = 'mobile',
}: WeeklyCalendarContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isUsersListOpen, setIsUsersListOpen] = useState(false)

  const weekRange = useMemo(() => calculateWeekRange(weekOffset), [weekOffset])
  const weekStart = useMemo(() => new Date(weekRange.startDate), [weekRange.startDate])
  const weekEnd = useMemo(() => new Date(weekRange.endDate), [weekRange.endDate])

  const { absenceRequests, isFetching } = useGetApprovedLeavesByTime({
    fromTime: weekRange.startDate,
    toTime: weekRange.endDate,
    offset: 0,
    limit: 100,
  })

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const leaveDates = useMemo(() => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('WeeklyCalendar - absenceRequests:', absenceRequests)
      console.log('WeeklyCalendar - weekStart:', weekStart, 'weekEnd:', weekEnd)
    }
    const dates = getLeaveDates(weekStart, weekEnd, absenceRequests)
    if (process.env.NODE_ENV === 'development') {
      console.log('WeeklyCalendar - leaveDates:', Array.from(dates))
    }
    return dates
  }, [weekStart, weekEnd, absenceRequests])

  const handleDateClick = (date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    if (leaveDates.has(dateStr)) {
      setSelectedDate(date)
      setIsUsersListOpen(true)
    }
  }

  const handlePreviousWeek = () => {
    onWeekOffsetChange(weekOffset - 1)
  }

  const handleNextWeek = () => {
    onWeekOffsetChange(weekOffset + 1)
  }

  const formatWeekLabel = () => {
    if (variant === 'web') {
      const start = weekStart.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const end = weekEnd.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      return `${start} - ${end}`
    }
    const start = weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    const end = weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    return `${start} - ${end}`
  }

  const isWeb = variant === 'web'

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between', isWeb ? 'mb-6' : 'mb-4')}>
        {!isWeb && <h3 className="text-base font-semibold">Lịch nghỉ phép tuần</h3>}
        <div className={cn('flex items-center', isWeb ? 'gap-3' : 'gap-2')}>
          <Button
            variant={isWeb ? 'outline' : 'ghost'}
            size={isWeb ? 'icon' : 'icon-sm'}
            onClick={handlePreviousWeek}
            disabled={isFetching}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span
            className={cn(
              'font-medium text-center',
              isWeb ? 'text-sm min-w-[200px]' : 'text-sm min-w-[120px]'
            )}
          >
            {formatWeekLabel()}
          </span>
          <Button
            variant={isWeb ? 'outline' : 'ghost'}
            size={isWeb ? 'icon' : 'icon-sm'}
            onClick={handleNextWeek}
            disabled={isFetching}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={cn('grid grid-cols-7', isWeb ? 'gap-3' : 'gap-2')}>
        {weekDays.map((day, index) => {
          const dateStr = dayjs(day.date).format('YYYY-MM-DD')
          const hasLeave = leaveDates.has(dateStr)
          const isToday = dayjs().format('YYYY-MM-DD') === dateStr

          return (
            <div
              key={index}
              onClick={() => hasLeave && handleDateClick(day.date)}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border transition-colors',
                isWeb ? 'p-4' : 'p-2',
                hasLeave && 'bg-primary/10 border-primary',
                isToday && 'ring-2 ring-primary/50',
                hasLeave && 'cursor-pointer hover:bg-primary/20 active:scale-95',
                !hasLeave && isWeb && 'hover:bg-accent/50'
              )}
              title={hasLeave ? 'Bấm để xem danh sách người nghỉ' : undefined}
            >
              <div className={cn('text-muted-foreground mb-1', isWeb ? 'text-sm mb-2' : 'text-xs')}>
                {day.dayOfWeek}
              </div>
              <div
                className={cn(
                  'font-medium',
                  isWeb ? 'text-base' : 'text-sm',
                  hasLeave && 'text-primary font-semibold',
                  isToday && 'text-primary'
                )}
              >
                {day.label}
              </div>
              {hasLeave && (
                <div
                  className={cn(
                    'mt-1 rounded-full bg-primary',
                    isWeb ? 'mt-2 size-2' : 'mt-1 size-1.5'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div
        className={cn(
          'flex items-center justify-center gap-4 mt-4 text-muted-foreground',
          isWeb ? 'text-sm gap-6 mt-6' : 'text-xs'
        )}
      >
        <div className={cn('flex items-center', isWeb ? 'gap-2' : 'gap-1.5')}>
          <div className={cn('rounded-full bg-primary', isWeb ? 'size-2' : 'size-1.5')} />
          <span>Có người nghỉ</span>
        </div>
        {leaveDates.size > 0 && (
          <span className="text-xs text-muted-foreground/70">(Bấm vào ngày để xem chi tiết)</span>
        )}
      </div>

      {/* Users List Modal/Sheet */}
      {variant === 'mobile' ? (
        <BottomSheet
          open={isUsersListOpen}
          onOpenChange={setIsUsersListOpen}
          title="Danh sách người nghỉ"
          maxHeightClassName="max-h-[70vh]"
        >
          {selectedDate && (
            <LeaveUsersList
              date={selectedDate}
              leaves={absenceRequests}
              onClose={() => setIsUsersListOpen(false)}
              variant="mobile"
            />
          )}
        </BottomSheet>
      ) : (
        <Dialog open={isUsersListOpen} onOpenChange={setIsUsersListOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Danh sách người nghỉ</DialogTitle>
            </DialogHeader>
            {selectedDate && (
              <LeaveUsersList
                date={selectedDate}
                leaves={absenceRequests}
                onClose={() => setIsUsersListOpen(false)}
                variant="web"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
