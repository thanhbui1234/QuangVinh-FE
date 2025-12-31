import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey } from '@/constants'

export interface updateTaskPayload {
  taskId: number
  description?: string
  priority?: number
  taskType?: number
  groupId?: number
  estimateTime?: number
  imageUrls?: string[]
  assigneeIds?: number[]
  supervisorId?: number
  checkList?: string
  assignees?: Array<{ id: number }>
  supervisor?: { id: number }
  status?: number
  startTime?: number
  progressScore?: number
  recurrenceType?: number
  recurrenceInterval?: number
  recurrenceEnable?: boolean
}

export const useUpdateTask = () => {
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: updateTaskPayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_TASK, payload)
      return response
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [detailTaskKey.detail(variables.taskId.toString()), { taskId: variables.taskId }],
      })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật công việc thành công',
        description: response.message,
      })
    },
  })
  return { updateTaskMutation, isUpdateTaskLoading: updateTaskMutation.isPending }
}
