import { useMemo } from 'react'
import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from '@/constants/assignments/task'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdatePriority } from '@/hooks/assignments/task/updatePriority'
import { ChevronDown, Repeat, Clock } from 'lucide-react'
import {
  type RecurrenceType,
  RECURRENCE_TYPE_LABELS,
} from '@/components/Assignments/RecurrenceSettings'
import { Switch } from '@/components/ui/switch'
import { useUpdateTask } from '@/hooks/assignments/task/useUpdateTask'

export const DetailSection = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const updatePriorityMutation = useUpdatePriority(projectAssignmentDetail)
  const { updateTaskMutation } = useUpdateTask()

  // Memoize priority color config
  const priorityConfig = useMemo(() => {
    const priority = projectAssignmentDetail?.priority || 1
    switch (priority) {
      case 4: // Rất cao
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        }
      case 3: // Cao
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        }
      case 2: // Trung bình
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
        }
      default: // Thấp
        return {
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-muted',
        }
    }
  }, [projectAssignmentDetail?.priority])

  return (
    <div className="my-6 border-t pt-4">
      <details open className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none font-semibold text-sm text-foreground mb-4">
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-0 -rotate-90" />
          Chi tiết
        </summary>

        <div className="space-y-3 ml-6">
          {/* Type */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Loại công việc:</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                {TASK_TYPE_LABELS[projectAssignmentDetail?.taskType || 1] || 'Không xác định'}
              </span>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Mức độ:</span>
            <Select
              value={String(projectAssignmentDetail?.priority || 1)}
              onValueChange={(value: string) => {
                updatePriorityMutation.mutate(Number(value))
              }}
              disabled={projectAssignmentDetail?.status === 9}
            >
              <SelectTrigger
                className={`${priorityConfig.bgColor} ${priorityConfig.textColor} ${priorityConfig.borderColor} w-[140px] h-8 text-xs font-medium`}
              >
                <SelectValue>
                  {TASK_PRIORITY_LABELS[projectAssignmentDetail?.priority || 1]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_PRIORITY_LABELS).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-sm">
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence Information */}
          {projectAssignmentDetail?.recurrenceType && (
            <>
              <div className="flex items-start gap-3 pt-2 border-t">
                <span className="text-sm text-muted-foreground w-20 shrink-0 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" />
                  Lặp lại:
                </span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {RECURRENCE_TYPE_LABELS[
                        String(projectAssignmentDetail?.recurrenceType || '2') as RecurrenceType
                      ] || 'N/A'}
                    </span>
                    {projectAssignmentDetail?.recurrenceInterval && (
                      <span className="text-xs text-muted-foreground">
                        (Mỗi {projectAssignmentDetail.recurrenceInterval}{' '}
                        {projectAssignmentDetail.recurrenceType === 1
                          ? 'giờ'
                          : projectAssignmentDetail.recurrenceType === 2
                            ? 'ngày'
                            : projectAssignmentDetail.recurrenceType === 3
                              ? 'tuần'
                              : 'tháng'}
                        )
                      </span>
                    )}
                  </div>
                  {projectAssignmentDetail?.nextExecutionTime && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Lần thực hiện tiếp theo:{' '}
                      {new Date(projectAssignmentDetail.nextExecutionTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      checked={projectAssignmentDetail?.recurrenceEnable || false}
                      onCheckedChange={(checked) => {
                        updateTaskMutation.mutate({
                          taskId: projectAssignmentDetail?.taskId || projectAssignmentDetail?.id,
                          recurrenceEnable: checked,
                        })
                      }}
                      disabled={updateTaskMutation.isPending}
                    />
                    <span className="text-xs text-muted-foreground">
                      {projectAssignmentDetail?.recurrenceEnable ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  )
}
