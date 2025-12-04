import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import type { IProject } from '@/types/project'
import { API_ENDPOINT } from '@/common'
import { projectsAssignmentsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

export const useCreateProject = () => {
  const createProjectMutation = useMutation({
    mutationFn: async (payload: IProject) => {
      const response = await POST(API_ENDPOINT.CREATE_PROJECT, payload)
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [projectsAssignmentsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Tạo dự án thành công',
        description: respones.message,
      })
    },
  })

  return { createProjectMutation }
}
