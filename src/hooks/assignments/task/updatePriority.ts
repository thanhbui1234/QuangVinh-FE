import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey } from '@/constants'

export const useUpdatePriority = (task: any) => {
  const updatePriorityMutation = useMutation({
    mutationFn: async (newPriority: number) => {
      const response = await POST(API_ENDPOINT.UPDATE_PRIORITY, {
        taskId: task.taskId,
        newPriority,
      })
      return response
    },
    onSuccess: (response, newPriority) => {
      const taskQueryKey = [detailTaskKey.detail(task.taskId.toString()), { taskId: task.taskId }]

      queryClient.setQueryData(taskQueryKey, (oldData: any) => {
        if (!oldData) {
          return oldData
        }
        return {
          ...oldData,
          priority: newPriority,
          task: {
            ...oldData.task,
            priority: newPriority,
          },
        }
      })

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật mức độ thành công',
        description: response.message || 'Đã cập nhật priority',
      })
    },
  })
  return updatePriorityMutation
}
