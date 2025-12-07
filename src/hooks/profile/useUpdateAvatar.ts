import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { profileKey } from '@/constants'

interface UpdateAvatarPayload {
  avatar: string
}
export const useUpdateAvatar = (userId: any) => {
  const { mutate } = useMutation({
    mutationFn: async (payload: UpdateAvatarPayload) => {
      return await POST(API_ENDPOINT.UPDATE_AVATAR, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [profileKey.detail(userId)] })
    },
  })

  return { updateAvatarMutate: mutate }
}
