import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { queryClient } from '@/lib/queryClient'
import { profileKey } from '@/constants'
import type { ProfileUpdatePayload } from '@/schemas/profileSchema'

export const useUpdateProfile = (userId: any) => {
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const formData = new FormData()
      formData.append('name', payload.name)
      formData.append('email', payload.email)
      if (payload.phone) formData.append('phone', payload.phone)
      if (payload.position) formData.append('position', payload.position)
      if (payload.avatar) formData.append('avatar', payload.avatar)

      const response = await POST(`/api/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [profileKey.detail(userId.toString()), { id: userId }],
      })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật thông tin thành công',
        description: response.message,
      })
    },
    onError: () => {
      SonnerToaster({
        type: 'error',
        message: 'Cập nhật thất bại',
        description: 'Vui lòng thử lại',
      })
    },
  })
  return updateProfileMutation
}
