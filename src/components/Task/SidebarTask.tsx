import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock4, Repeat, Clock, Power, Pencil, Copy } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatTimestamp, getFormattedEstimate } from '@/utils/CommonUtils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import UserAvatar from '../ui/avatarUser'
import {
  type RecurrenceType,
  RECURRENCE_TYPE_LABELS,
} from '@/components/Assignments/RecurrenceSettings'
import { Switch } from '@/components/ui/switch'
import { useUpdateRecurrence } from '@/hooks/assignments/task/useUpdateRecurrence'
import { cn } from '@/lib/utils'
import { EditRecurrenceModal } from './EditRecurrenceModal'
import { useState } from 'react'

const DAY_OF_WEEK_LABELS: Record<string, string> = {
  '1': 'Thứ 2',
  '2': 'Thứ 3',
  '3': 'Thứ 4',
  '4': 'Thứ 5',
  '5': 'Thứ 6',
  '6': 'Thứ 7',
  '7': 'Chủ nhật',
}

interface RecurrenceSchedule {
  type: number // 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
  interval: number
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  hours?: number[]
  minutes?: number[]
}

const formatRecurrenceSchedule = (schedule: RecurrenceSchedule): string => {
  const typeLabel =
    RECURRENCE_TYPE_LABELS[String(schedule.type) as keyof typeof RECURRENCE_TYPE_LABELS] ||
    'Không xác định'

  const parts: string[] = []

  // Interval
  if (schedule.interval > 1) {
    const unit =
      schedule.type === 1
        ? 'giờ'
        : schedule.type === 2
          ? 'ngày'
          : schedule.type === 3
            ? 'tuần'
            : 'tháng'
    parts.push(`Mỗi ${schedule.interval} ${unit}`)
  } else {
    parts.push(typeLabel)
  }

  // Days of week (for WEEKLY)
  if (schedule.type === 3 && schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    const dayLabels = schedule.daysOfWeek
      .map((day) => DAY_OF_WEEK_LABELS[String(day)])
      .filter(Boolean)
      .join(', ')
    if (dayLabels) {
      parts.push(`vào ${dayLabels}`)
    }
  }

  // Days of month (for MONTHLY)
  if (schedule.type === 4 && schedule.daysOfMonth && schedule.daysOfMonth.length > 0) {
    const days = schedule.daysOfMonth.join(', ')
    parts.push(`ngày ${days}`)
  }

  // Hours
  if (schedule.hours && schedule.hours.length > 0) {
    const hours = schedule.hours.map((h) => `${h} giờ`).join(', ')
    parts.push(`lúc ${hours}`)
  }

  // Minutes
  if (schedule.minutes && schedule.minutes.length > 0 && schedule.minutes.some((m) => m !== 0)) {
    const minutes = schedule.minutes.map((m) => `${m} phút`).join(', ')
    parts.push(`${minutes}`)
  }

  return parts.join(' ')
}

export const SidebarTask = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const path = window.location.href
  const updateRecurrenceMutation = useUpdateRecurrence(projectAssignmentDetail)
  const [isEditRecurrenceOpen, setIsEditRecurrenceOpen] = useState(false)

  const assignees = projectAssignmentDetail?.assignees || []
  const supervisor = projectAssignmentDetail?.supervisor

  // Recurrence data
  const hasRecurrence = projectAssignmentDetail?.recurrenceEnable
  const recurrenceType = hasRecurrence
    ? (String(projectAssignmentDetail?.recurrenceType || '2') as RecurrenceType)
    : null
  const recurrenceLabel = recurrenceType ? RECURRENCE_TYPE_LABELS[recurrenceType] || 'N/A' : ''
  const interval = projectAssignmentDetail?.recurrenceInterval || 1
  const isRecurrenceEnabled = projectAssignmentDetail?.recurrenceEnable || false
  const nextExecutionTime = projectAssignmentDetail?.nextExecutionTime
  const recurrenceSchedules = projectAssignmentDetail?.recurrenceSchedules || []

  const getIntervalText = () => {
    if (!hasRecurrence) return ''
    if (interval === 1) {
      return recurrenceLabel.toLowerCase()
    }
    const unit =
      projectAssignmentDetail.recurrenceType === 1
        ? 'giờ'
        : projectAssignmentDetail.recurrenceType === 2
          ? 'ngày'
          : projectAssignmentDetail.recurrenceType === 3
            ? 'tuần'
            : 'tháng'
    return `Mỗi ${interval} ${unit}`
  }

  const formatNextExecution = () => {
    if (!nextExecutionTime) return null
    const date = new Date(nextExecutionTime)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleToggleRecurrence = (checked: boolean) => {
    // Khi tắt recurrence (checked = false), truyền recurrenceEnable: false lên API
    updateRecurrenceMutation.mutate({
      taskId: projectAssignmentDetail?.taskId || projectAssignmentDetail?.id,
      recurrenceEnable: checked,
      // Nếu tắt đi, không cần truyền các thông tin recurrence khác
      ...(checked === false && {
        recurrenceType: undefined,
        recurrenceInterval: undefined,
        daysOfWeek: undefined,
        daysOfMonth: undefined,
        hours: undefined,
        minutes: undefined,
      }),
    })
  }

  return (
    <div className="relative lg:col-span-1">
      <Card className="border-0 shadow-sm sticky top-6 hidden lg:block">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Thông tin công việc</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer hover:bg-accent hover:text-accent-foreground p-2 rounded-md">
                <Copy className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuLabel>Sao chép liên kết</DropdownMenuLabel>
                <Input value={path} readOnly autoFocus onFocus={(e) => e.target.select()} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-5">
            {/* ASSIGNEES */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Người được giao
              </label>

              <div className="space-y-2">
                {assignees.length > 0 ? (
                  assignees.map((user: any) => (
                    <div key={user.id} className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                      <UserAvatar id={user.id} name={user.name} avatar={user.avatar} />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">Chưa có người được giao</div>
                )}
              </div>
            </div>

            {/* REPORTER */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Người giao việc
              </label>
              <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                <UserAvatar
                  id={projectAssignmentDetail?.creator?.id}
                  name={projectAssignmentDetail?.creator?.name}
                  avatar={projectAssignmentDetail?.creator?.avatar}
                />
              </div>
            </div>

            {/* SUPERVISOR */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Người chịu trách nhiệm
              </label>
              <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                <UserAvatar
                  id={supervisor?.id}
                  name={supervisor?.name}
                  avatar={supervisor?.avatar}
                />
              </div>
            </div>

            {/* ESTIMATE */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Thời gian ước lượng
              </label>
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Clock4 className="w-5 h-5 text-white" />
                </div>
                {getFormattedEstimate(
                  projectAssignmentDetail?.startTime,
                  projectAssignmentDetail?.estimateTime
                )}
              </div>
            </div>

            {/* RECURRENCE */}
            {hasRecurrence && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground block">Lặp lại</label>
                  <button
                    onClick={() => setIsEditRecurrenceOpen(true)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Chỉnh sửa
                  </button>
                </div>
                <div
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    'bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30',
                    'border-purple-200/50 dark:border-purple-800/50',
                    !isRecurrenceEnabled && 'opacity-70'
                  )}
                >
                  <div className="space-y-3">
                    {/* Header with icon and status */}
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                          'bg-gradient-to-br from-purple-500 to-blue-500',
                          'shadow-sm',
                          !isRecurrenceEnabled && 'opacity-50 grayscale'
                        )}
                      >
                        <Repeat className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {recurrenceLabel}
                          </span>
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isRecurrenceEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{getIntervalText()}</p>
                      </div>
                    </div>

                    {/* Next Execution Time */}
                    {nextExecutionTime && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 dark:bg-black/20 rounded-md px-2.5 py-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Tiếp theo: {formatNextExecution()}</span>
                      </div>
                    )}

                    {/* Recurrence Schedules Details */}
                    {recurrenceSchedules.length > 0 && (
                      <div className="pt-2 border-t border-purple-200/50 dark:border-purple-800/50 space-y-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1.5">
                          Lịch lặp lại chi tiết:
                        </div>
                        {recurrenceSchedules.map((schedule: RecurrenceSchedule, index: number) => (
                          <div
                            key={index}
                            className="p-2.5 rounded-md bg-white/60 dark:bg-black/20 border border-purple-200/30 dark:border-purple-800/30"
                          >
                            <div className="text-xs font-semibold text-foreground mb-1.5">
                              {formatRecurrenceSchedule(schedule)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                              {schedule.hours && schedule.hours.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Giờ: {schedule.hours.join(', ')}</span>
                                </div>
                              )}
                              {schedule.minutes && schedule.minutes.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Phút: {schedule.minutes.join(', ')}</span>
                                </div>
                              )}
                              {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Ngày:{' '}
                                    {schedule.daysOfWeek
                                      .map((day) => DAY_OF_WEEK_LABELS[String(day)])
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                              {schedule.daysOfMonth && schedule.daysOfMonth.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Ngày: {schedule.daysOfMonth.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-center gap-2">
                        <Power
                          className={cn(
                            'w-3.5 h-3.5',
                            isRecurrenceEnabled ? 'text-green-600' : 'text-gray-400'
                          )}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {isRecurrenceEnabled ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </div>
                      <Switch
                        checked={isRecurrenceEnabled}
                        onCheckedChange={handleToggleRecurrence}
                        disabled={updateRecurrenceMutation.isPending}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* DATES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Ngày bắt đầu công việc
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatTimestamp(projectAssignmentDetail?.startTime)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Ngày tạo</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatTimestamp(projectAssignmentDetail?.createdTime)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Cập nhật</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatTimestamp(projectAssignmentDetail?.updatedTime)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Recurrence Modal */}
      <EditRecurrenceModal
        open={isEditRecurrenceOpen}
        onOpenChange={setIsEditRecurrenceOpen}
        task={projectAssignmentDetail}
      />
    </div>
  )
}
