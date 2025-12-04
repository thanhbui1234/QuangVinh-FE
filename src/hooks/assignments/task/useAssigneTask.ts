import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey, projectAssignmentDetailKey } from '@/constants'

export const useAssigneTask = ({ taskId, groupId }: { taskId: number; groupId: number }) => {
  const assigneTaskMutation = useMutation({
    mutationFn: async (assigneeId: number) => {
      const response = await POST(API_ENDPOINT.ASIGN_TASK, { taskId, assigneeId })
      return response
    },
    onSuccess: (response, assigneeId) => {
      const taskQueryKey = [detailTaskKey.detail(taskId.toString()), { taskId }]

      if (response.assignee && response.assignee.name) {
        queryClient.setQueryData(taskQueryKey, (oldData: any) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            assigneeId: assigneeId,
            assignee: response.assignee,
            task: {
              ...oldData.task,
              assigneeId: assigneeId,
              assignee: response.assignee,
            },
          }
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: taskQueryKey,
        })
      }

      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(groupId.toString())],
      })

      SonnerToaster({
        type: 'success',
        message: 'Giao việc thành công',
        description: response.message || 'Đã cập nhật người thực hiện',
      })
    },
  })
  return assigneTaskMutation
}
