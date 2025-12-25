import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey, projectAssignmentDetailKey } from '@/constants'

export const useUpdateStatus = (task: any) => {
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: number) => {
      if (!task.taskId) {
        throw new Error('taskId is missing! task object: ' + JSON.stringify(task))
      }

      const response = await POST(API_ENDPOINT.UPDATE_STATUS, { taskId: task.taskId, newStatus })
      return response
    },
    onSuccess: (response, newStatus) => {
      const taskQueryKey = [detailTaskKey.detail(task.taskId.toString()), { taskId: task.taskId }]

      queryClient.setQueryData(taskQueryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          status: newStatus,
          task: {
            ...oldData.task,
            status: newStatus,
          },
        }
      })

      queryClient.refetchQueries({
        queryKey: [projectAssignmentDetailKey.detail(task.groupId.toString())],
      })

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật trạng thái thành công',
        description: response.message || 'Đã cập nhật trạng thái',
      })
    },
  })
  return updateStatusMutation
}
