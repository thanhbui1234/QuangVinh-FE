import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, MessageCircle } from 'lucide-react'
import { useUpdateStatus } from '@/hooks/assignments/task/useUpdateStatus'
import { DialogAssignee } from './DialogAsignne'
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_FLOW } from '@/constants/assignments/task'

export const ButtonAction = ({
  setEditOpen,
  projectAssignmentDetail,
  memberTask,
}: {
  setEditOpen: (open: boolean) => void
  projectAssignmentDetail: any
  memberTask: any
}) => {
  type TaskStatusType = 1 | 2 | 8 | 9
  const updateStatusMutation = useUpdateStatus(projectAssignmentDetail)
  const currentStatus = (projectAssignmentDetail?.status || TASK_STATUS.CREATED) as TaskStatusType

  // Lấy danh sách options từ FLOW
  const availableOptions = useMemo(() => {
    return TASK_STATUS_FLOW[currentStatus] || []
  }, [currentStatus])

  // Status label + màu theo mapping chung
  const statusInfo = useMemo(() => {
    const map = {
      [TASK_STATUS.CREATED]: {
        label: TASK_STATUS_LABELS[TASK_STATUS.CREATED],
        bgColor: 'bg-slate-500',
        hoverColor: 'hover:bg-slate-600',
        borderColor: 'border-slate-500',
      },
      [TASK_STATUS.VISIBLE]: {
        label: TASK_STATUS_LABELS[TASK_STATUS.VISIBLE],
        bgColor: 'bg-amber-500',
        hoverColor: 'hover:bg-amber-600',
        borderColor: 'border-amber-500',
      },
      [TASK_STATUS.IN_PROGRESS]: {
        label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS],
        bgColor: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
        borderColor: 'border-blue-600',
      },
      [TASK_STATUS.COMPLETED]: {
        label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED],
        bgColor: 'bg-green-600',
        hoverColor: 'hover:bg-green-700',
        borderColor: 'border-green-600',
      },
    }

    return map[currentStatus] || map[TASK_STATUS.CREATED]
  }, [currentStatus])

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Chỉnh sửa */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditOpen(true)}
        className="text-gray-700 hover:bg-gray-100 bg-gray-200"
      >
        <Pencil className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Chỉnh sửa</span>
      </Button>

      {/* Bình luận */}
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-700 hover:bg-gray-100 bg-gray-200"
        onClick={() => {
          const commentSection = document.querySelector('.comments-section')
          commentSection?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        <MessageCircle className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Thêm bình luận</span>
      </Button>

      {/* Chọn assignee */}
      <DialogAssignee memberTask={memberTask} task={projectAssignmentDetail} />

      {/* Dropdown chuyển trạng thái */}
      <Select
        value={String(currentStatus)}
        onValueChange={(value: string) => {
          updateStatusMutation.mutate(Number(value))
        }}
        disabled={currentStatus === TASK_STATUS.COMPLETED}
      >
        <SelectTrigger
          className={`${statusInfo.bgColor} ${statusInfo.hoverColor} ${statusInfo.borderColor} text-white min-w-[120px] sm:min-w-[180px] disabled:opacity-100 `}
        >
          <SelectValue>{statusInfo.label}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {availableOptions.map((option: any) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
