import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { profileKey } from '@/constants'

interface UpdateEmailPayload {
  email: string
}
export const useUpdateEmail = (userId: any) => {
  const { mutate } = useMutation({
    mutationFn: async (payload: UpdateEmailPayload) => {
      return await POST(API_ENDPOINT.UPDATE_EMAIL, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileKey.detail(userId.toString()), { id: userId }],
      })
    },
  })

  return { updateEmailMutate: mutate }
}
