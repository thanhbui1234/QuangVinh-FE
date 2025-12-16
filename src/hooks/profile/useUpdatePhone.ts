import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { profileKey } from '@/constants'

interface UpdatePhonePayload {
  phone: string
}
export const useUpdatePhone = (userId: any) => {
  const { mutate } = useMutation({
    mutationFn: async (payload: UpdatePhonePayload) => {
      return await POST(API_ENDPOINT.UPDATE_PHONE, { phoneNumber: payload.phone })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileKey.detail(userId.toString()), { id: userId }],
      })
    },
  })

  return { updatePhoneMutate: mutate }
}
