import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey, projectAssignmentDetailKey } from '@/constants'

export interface updateTaskPayload {
  taskId: number
  checklist: string
  groupId?: number
}

export const useUpdateDescription = () => {
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: updateTaskPayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_CHECKLIST, payload)
      return response
    },
    onSuccess: (response, variables) => {
      const taskQueryKey = [
        detailTaskKey.detail(variables.taskId.toString()),
        { taskId: variables.taskId },
      ]

      queryClient.setQueryData(taskQueryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          checkList: variables.checklist,
          task: {
            ...oldData.task,
            checkList: variables.checklist,
          },
        }
      })

      // Invalidate project list nếu cần
      if (variables.groupId) {
        queryClient.invalidateQueries({
          queryKey: [projectAssignmentDetailKey.detail(variables.groupId.toString())],
        })
      }

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật mô tả thành công',
        description: response.message || 'Đã cập nhật mô tả công việc',
      })
    },
  })
  return updateTaskMutation
}
