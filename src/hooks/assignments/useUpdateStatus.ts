import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import {
  projectAssignmentDetailKey,
  projectsAssignmentsKey,
} from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

type UpdatePayload = {
  taskGroupId: number
  newStatus: number
}

export const useUpdateStatus = () => {
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_PROJECT_STATUS, payload)
      return response
    },
    onSuccess: (respones, variables) => {
      queryClient.invalidateQueries({ queryKey: [projectsAssignmentsKey.getAll] })
      queryClient.invalidateQueries({
        queryKey: [projectAssignmentDetailKey.detail(variables.taskGroupId.toString())],
      })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật trạng thái dự án thành công',
        description: respones.message,
      })
    },
  })

  return { updateStatusMutation }
}
