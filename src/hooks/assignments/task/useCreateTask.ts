import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { projectAssignmentDetailKey } from '@/constants'

export interface CreateTaskPayload {
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
}

export const useCreateTask = () => {
  const createTaskMutation = useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await POST(API_ENDPOINT.CREATE_TASK, payload)
      return response
    },
    onSuccess: (response, variables) => {
      const { groupId } = variables
      // Invalidate all project detail queries (regardless of specific ID)
      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(groupId.toString()), { taskGroupId: groupId }],
      })
      SonnerToaster({
        type: 'success',
        message: 'Tạo công việc thành công',
        description: response.message,
      })
    },
  })
  return createTaskMutation
}
