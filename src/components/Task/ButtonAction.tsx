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

export const ButtonAction = ({
  setEditOpen,
  projectAssignmentDetail,
  memberTask,
}: {
  setEditOpen: (open: boolean) => void
  projectAssignmentDetail: any
  memberTask: any
}) => {
  const updateStatusMutation = useUpdateStatus(projectAssignmentDetail)
  const currentStatus = projectAssignmentDetail?.status || 1

  // Memoize available options based on current status
  const availableOptions = useMemo(() => {
    switch (currentStatus) {
      case 1: // Chưa bắt đầu
        return [
          { value: '8', label: 'Đang tiến hành' },
          { value: '4', label: 'Chờ xử lý - Có sự cố' },
        ]
      case 8: // Đang tiến hành
        return [
          { value: '9', label: 'Hoàn thành' },
          { value: '4', label: 'Chờ xử lý - Có sự cố' },
        ]
      case 4: // Chờ xử lý
        return [
          { value: '8', label: 'Đang tiến hành' },
          { value: '9', label: 'Hoàn thành' },
        ]
      case 9: // Hoàn thành - có thể reopen
        return [
          { value: '8', label: 'Đang tiến hành' },
          { value: '4', label: 'Chờ xử lý - Có sự cố' },
        ]
      default:
        return []
    }
  }, [currentStatus])

  // Memoize status info for color and label
  const statusInfo = useMemo(() => {
    switch (currentStatus) {
      case 1:
        return {
          label: 'Chưa bắt đầu',
          bgColor: 'bg-slate-500',
          hoverColor: 'hover:bg-slate-600',
          borderColor: 'border-slate-500',
        }
      case 8:
        return {
          label: 'Đang tiến hành',
          bgColor: 'bg-blue-600',
          hoverColor: 'hover:bg-blue-700',
          borderColor: 'border-blue-600',
        }
      case 9:
        return {
          label: 'Hoàn thành',
          bgColor: 'bg-green-600',
          hoverColor: 'hover:bg-green-700',
          borderColor: 'border-green-600',
        }
      case 4:
        return {
          label: 'Chờ xử lý - Có sự cố',
          bgColor: 'bg-amber-500',
          hoverColor: 'hover:bg-amber-600',
          borderColor: 'border-amber-500',
        }
      default:
        return {
          label: 'Không xác định',
          bgColor: 'bg-gray-500',
          hoverColor: 'hover:bg-gray-600',
          borderColor: 'border-gray-500',
        }
    }
  }, [currentStatus])

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditOpen(true)}
        className="text-gray-700 hover:bg-gray-100 bg-gray-200"
      >
        <Pencil className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Chỉnh sửa</span>
      </Button>
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
      <DialogAssignee memberTask={memberTask} task={projectAssignmentDetail} />
      <Select
        value={String(currentStatus)}
        onValueChange={(value: string) => {
          updateStatusMutation.mutate(Number(value))
        }}
      >
        <SelectTrigger
          className={`${statusInfo.bgColor} ${statusInfo.hoverColor} ${statusInfo.borderColor} text-white min-w-[120px] sm:min-w-[180px]`}
        >
          <SelectValue>{statusInfo.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
