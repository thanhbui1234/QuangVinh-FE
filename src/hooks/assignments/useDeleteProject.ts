import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { projectsAssignmentsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

type DeletePayload = {
  taskGroupId: number
  newStatus: number
}

export const useDeleteProject = () => {
  const deleteProjectMutation = useMutation({
    mutationFn: async (payload: DeletePayload) => {
      const response = await POST(API_ENDPOINT.DELETE_PROJECT, payload)
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [projectsAssignmentsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Xóa dự án thành công',
        description: respones.message,
      })
    },
  })

  return { deleteProjectMutation }
}
