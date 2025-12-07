import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { profileKey } from '@/constants'

interface UpdateNamePayload {
  name: string
}
export const useUpdateName = (userId: any) => {
  const { mutate } = useMutation({
    mutationFn: async (payload: UpdateNamePayload) => {
      return await POST(API_ENDPOINT.UPDATE_NAME, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [profileKey.detail(userId)] })
    },
  })

  return { updateNameMutate: mutate }
}
