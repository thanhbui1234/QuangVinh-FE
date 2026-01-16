import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { detailTaskKey } from '@/constants'

export interface RecurrenceSchedule {
  type: number // 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
  interval: number // default: 1
  daysOfWeek?: number[] // for WEEKLY (1=Monday, 7=Sunday)
  daysOfMonth?: number[] // for MONTHLY (1-31)
  hours?: number[] // hours in day (0-23)
  minutes?: number[] // minutes in hour (0-59), default [0] if empty
}

export interface updateRecurrencePayload {
  taskId: number
  recurrenceType?: number
  recurrenceInterval?: number
  recurrenceEnable?: boolean
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  hours?: number[]
  minutes?: number[]
}

export const useUpdateRecurrence = (task: any) => {
  const updateRecurrenceMutation = useMutation({
    mutationFn: async (payload: updateRecurrencePayload) => {
      const {
        taskId,
        recurrenceType,
        recurrenceInterval,
        daysOfWeek,
        daysOfMonth,
        hours,
        minutes,
        recurrenceEnable,
        ...rest
      } = payload

      // Build recurrenceSchedules array if recurrence is enabled and has type
      const recurrenceSchedules: RecurrenceSchedule[] =
        recurrenceEnable && recurrenceType
          ? [
              {
                type: recurrenceType,
                interval: recurrenceInterval ?? 1, // default: 1
                ...(daysOfWeek && daysOfWeek.length > 0 && { daysOfWeek }),
                ...(daysOfMonth && daysOfMonth.length > 0 && { daysOfMonth }),
                ...(hours && hours.length > 0 && { hours }),
                // Only include minutes if provided and not empty, default to [0] if empty
                ...(minutes && minutes.length > 0 ? { minutes } : { minutes: [0] }),
              },
            ]
          : []

      const transformedPayload = {
        taskId,
        ...rest,
        // Luôn truyền recurrenceEnable để API biết trạng thái (bật/tắt)
        recurrenceEnable: recurrenceEnable ?? false,
        ...(recurrenceSchedules.length > 0 && { recurrenceSchedules }),
      }

      const response = await POST(API_ENDPOINT.UPDATE_TASK, transformedPayload)
      return response
    },
    onSuccess: (response) => {
      const taskId = task.taskId || task.id
      if (!taskId) {
        console.error('taskId is missing! task object: ' + JSON.stringify(task))
        return
      }

      const taskQueryKey = [detailTaskKey.detail(taskId.toString()), { taskId }]

      // Invalidate query to refetch from server (to get updated recurrenceSchedules)
      queryClient.invalidateQueries({
        queryKey: taskQueryKey,
      })

      SonnerToaster({
        type: 'success',
        message: 'Cập nhật lặp lại thành công',
        description: response.message || 'Đã cập nhật thông tin lặp lại',
      })
    },
    onError: (error: any) => {
      console.error('Update recurrence error:', error)
      SonnerToaster({
        type: 'error',
        message: 'Cập nhật lặp lại thất bại',
        description: error?.message || 'Vui lòng thử lại',
      })
    },
  })
  return updateRecurrenceMutation
}
