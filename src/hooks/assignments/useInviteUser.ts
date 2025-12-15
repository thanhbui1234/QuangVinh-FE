import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { projectAssignmentDetailKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

interface IInviteUser {
  memberIds: number[]
  taskGroupId: number
}

export const useInviteUser = () => {
  const createProjectMutation = useMutation({
    mutationFn: async (payload: IInviteUser) => {
      const response = await POST(API_ENDPOINT.INVITE_USER, payload)
      return response
    },
    onSuccess: (respones, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          projectAssignmentDetailKey.detail(variables.taskGroupId.toString()),
          { taskGroupId: variables.taskGroupId },
        ],
      })
      SonnerToaster({
        type: 'success',
        message: 'Mời thành viên thành công',
        description: respones.message,
      })
    },
    onError: () => {
      SonnerToaster({
        type: 'error',
        message: 'Mời thành viên không thành công',
        description: 'Bạn không có quyền mời thành viên',
      })
    },
  })

  return { createProjectMutation }
}
