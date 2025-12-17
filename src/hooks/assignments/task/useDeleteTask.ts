import { queryClient } from '@/lib/queryClient'
import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { projectAssignmentDetailKey } from '@/constants'
import { API_ENDPOINT } from '@/common'
import SonnerToaster from '@/components/ui/toaster'

export const useDeleteTask = (task: number) => {
  const deleteTaskMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await POST(API_ENDPOINT.UPDATE_STATUS, { taskId: payload, newStatus: 10 })
      return response
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(task.toString()), { taskGroupId: task }],
      })
      SonnerToaster({
        type: 'success',
        message: 'Xoá công việc thành công',
        description: response.message,
      })
    },
  })
  return deleteTaskMutation
}
