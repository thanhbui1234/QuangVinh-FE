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
import { ChevronDown } from 'lucide-react'

export const DetailSection = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const updatePriorityMutation = useUpdatePriority(projectAssignmentDetail)

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
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        }
    }
  }, [projectAssignmentDetail?.priority])

  return (
    <div className="my-6 border-t pt-4">
      <details open className="group">
        <summary className="flex items-center gap-2 cursor-pointer list-none font-semibold text-sm text-gray-900 mb-4">
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-0 -rotate-90" />
          Chi tiết
        </summary>

        <div className="space-y-3 ml-6">
          {/* Type */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-gray-600 w-20 shrink-0">Loại:</span>
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
            <span className="text-sm text-gray-600 w-20 shrink-0">Mức độ:</span>
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
        </div>
      </details>
    </div>
  )
}
