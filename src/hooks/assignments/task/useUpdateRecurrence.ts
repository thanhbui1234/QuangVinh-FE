import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey } from '@/constants'

export interface updateRecurrencePayload {
  taskId: number
  recurrenceType?: number
  recurrenceInterval?: number
  recurrenceEnable?: boolean
}

export const useUpdateRecurrence = (task: any) => {
  const updateRecurrenceMutation = useMutation({
    mutationFn: async (payload: updateRecurrencePayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_TASK, {
        taskId: payload.taskId,
        recurrenceType: payload.recurrenceType,
        recurrenceInterval: payload.recurrenceInterval,
        recurrenceEnable: payload.recurrenceEnable,
      })
      return response
    },
    onSuccess: (response, variables) => {
      const taskId = task.taskId || task.id
      if (!taskId) {
        console.error('taskId is missing! task object: ' + JSON.stringify(task))
        return
      }

      const taskQueryKey = [detailTaskKey.detail(taskId.toString()), { taskId }]

      queryClient.setQueryData(taskQueryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          ...(variables.recurrenceType !== undefined && {
            recurrenceType: variables.recurrenceType,
          }),
          ...(variables.recurrenceInterval !== undefined && {
            recurrenceInterval: variables.recurrenceInterval,
          }),
          ...(variables.recurrenceEnable !== undefined && {
            recurrenceEnable: variables.recurrenceEnable,
          }),
          task: {
            ...oldData.task,
            ...(variables.recurrenceType !== undefined && {
              recurrenceType: variables.recurrenceType,
            }),
            ...(variables.recurrenceInterval !== undefined && {
              recurrenceInterval: variables.recurrenceInterval,
            }),
            ...(variables.recurrenceEnable !== undefined && {
              recurrenceEnable: variables.recurrenceEnable,
            }),
          },
        }
      })

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật lặp lại thành công',
        description: response.message || 'Đã cập nhật thông tin lặp lại',
      })
    },
  })
  return updateRecurrenceMutation
}
