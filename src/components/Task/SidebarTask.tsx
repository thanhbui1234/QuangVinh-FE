import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock4, Repeat, Clock, Power } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatTimestamp, getFormattedEstimate } from '@/utils/CommonUtils'
import { MdOutlineContentCopy } from 'react-icons/md'
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

export const SidebarTask = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const path = window.location.href
  const updateRecurrenceMutation = useUpdateRecurrence(projectAssignmentDetail)

  const assignees = projectAssignmentDetail?.assignees || []
  const supervisor = projectAssignmentDetail?.supervisor

  // Recurrence data
  const hasRecurrence = projectAssignmentDetail?.recurrenceType
  const recurrenceType = hasRecurrence
    ? (String(projectAssignmentDetail?.recurrenceType || '2') as RecurrenceType)
    : null
  const recurrenceLabel = recurrenceType ? RECURRENCE_TYPE_LABELS[recurrenceType] || 'N/A' : ''
  const interval = projectAssignmentDetail?.recurrenceInterval || 1
  const isRecurrenceEnabled = projectAssignmentDetail?.recurrenceEnable || false
  const nextExecutionTime = projectAssignmentDetail?.nextExecutionTime

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
    updateRecurrenceMutation.mutate({
      taskId: projectAssignmentDetail?.taskId || projectAssignmentDetail?.id,
      recurrenceEnable: checked,
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
                <MdOutlineContentCopy className="w-4 h-4" />
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
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Lặp lại
                </label>
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
    </div>
  )
}
