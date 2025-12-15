import { queryClient } from '@/lib/queryClient'
import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { personnelKey } from '@/constants'

export const useUpdateRole = () => {
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roles }: any) => {
      const response = await POST(API_ENDPOINT.UPDATE_ROLE, { userId, roles: [roles] })
      return response
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: personnelKey.getAll,
      })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật vai trò thành công',
        description: response.message,
      })
    },
  })
  return updateRoleMutation
}
