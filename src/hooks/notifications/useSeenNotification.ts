import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import { notiBellKey } from '@/constants'
import { queryClient } from '@/lib/queryClient'

type UpdateSeenPayload = {
  notiId: number
  seen: boolean
}

export const useSeenNotification = () => {
  const seenNotificationMutation = useMutation({
    mutationFn: async (payload: UpdateSeenPayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_SEEN_NOTIFICATION, payload)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notiBellKey.list] })
    },
  })

  return { seenNotificationMutation }
}
