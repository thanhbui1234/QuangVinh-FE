import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { projectAssignmentDetailKey } from '@/constants'

export interface CreateTaskTemplatePayload {
  description: string
  priority: number
  taskType: number
  groupId: number
  estimateTime: number
  imageUrls?: string[]
  checkList?: string
  assigneeIds?: number[]
  supervisorId?: number
  status?: number
  startTime?: number
  // Recurrence fields
  isRecurrenceEnabled: boolean
  recurrenceType?: number // 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
  recurrenceInterval?: number
  hourOfDay?: number // 0-23
  dayOfWeek?: number // 1=Monday, 7=Sunday
  dayOfMonth?: number // 1-31
}

export const useCreateTaskTemplate = () => {
  const createTaskTemplateMutation = useMutation({
    mutationFn: async (payload: CreateTaskTemplatePayload) => {
      const response = await POST(API_ENDPOINT.CREATE_TASK_TEMPLATE, payload)
      return response
    },
    onSuccess: (response, variables) => {
      const { groupId } = variables
      // Invalidate all project detail queries
      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(groupId.toString()), { taskGroupId: groupId }],
      })
      SonnerToaster({
        type: 'success',
        message: 'Tạo task template thành công',
        description:
          response.message || 'Task template sẽ được lặp lại tự động theo lịch đã cấu hình',
      })
    },
    onError: (error: any) => {
      SonnerToaster({
        type: 'error',
        message: 'Tạo task template thất bại',
        description: error?.message || 'Vui lòng thử lại',
      })
    },
  })
  return createTaskTemplateMutation
}
