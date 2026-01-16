import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { projectAssignmentDetailKey, projectsAssignmentsKey } from '@/constants'

export interface RecurrenceSchedule {
  type: number // 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
  interval: number // default: 1
  daysOfWeek?: number[] // for WEEKLY (1=Monday, 7=Sunday)
  daysOfMonth?: number[] // for MONTHLY (1-31)
  hours?: number[] // hours in day (0-23)
  minutes?: number[] // minutes in hour (0-59), default [0] if empty
}

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
  recurrenceType?: number // type: 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
  recurrenceInterval?: number // interval: default 1
  daysOfWeek?: number[] // for WEEKLY (1=Monday, 7=Sunday)
  daysOfMonth?: number[] // for MONTHLY (1-31)
  hours?: number[] // hours in day (0-23)
  minutes?: number[] // minutes in hour (0-59), default [0] if empty
}

export const useCreateTaskTemplate = () => {
  const createTaskTemplateMutation = useMutation({
    mutationFn: async (payload: CreateTaskTemplatePayload) => {
      // Transform payload to match backend format with recurrenceSchedules array
      const {
        recurrenceType,
        recurrenceInterval,
        daysOfWeek,
        daysOfMonth,
        hours,
        minutes,
        isRecurrenceEnabled,
        ...rest
      } = payload

      // Build recurrenceSchedules array if recurrence is enabled
      const recurrenceSchedules: RecurrenceSchedule[] =
        isRecurrenceEnabled && recurrenceType
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
        ...rest,
        isRecurrenceEnabled, // Always include isRecurrenceEnabled field
        ...(recurrenceSchedules.length > 0 && { recurrenceSchedules }),
      }

      const response = await POST(API_ENDPOINT.CREATE_TASK_TEMPLATE, transformedPayload)
      return response
    },
    onSuccess: (response, variables) => {
      const { groupId } = variables
      // Invalidate all project detail queries
      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(groupId.toString()), { taskGroupId: groupId }],
      })
      queryClient.refetchQueries({ queryKey: [projectsAssignmentsKey.getAll] })
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
