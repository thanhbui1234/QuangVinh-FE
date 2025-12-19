import { queryClient } from '@/lib/queryClient'
import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'

export const useUpdateRole = () => {
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roles }: any) => {
      const response = await POST(API_ENDPOINT.UPDATE_ROLE, { userId, roles: [roles] })
      return response
    },
    onSuccess: (response) => {
      // Invalidate và refetch tất cả queries với key này (cả active và inactive)
      queryClient.invalidateQueries({
        queryKey: ['personnel'],
        refetchType: 'all', // Force refetch cả các queries không active
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
