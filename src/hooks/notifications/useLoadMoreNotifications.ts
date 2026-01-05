import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { gtNotiId } from '@/constants/defaultQuery'

type LoadMoreNotificationsParams = {
  fromNotiId: number
  size?: number
}

export const useLoadMoreNotifications = () => {
  const loadMoreMutation = useMutation({
    mutationFn: async (params: LoadMoreNotificationsParams) => {
      const response = await POST(API_ENDPOINT.GET_NOTIFICATION, {
        fromNotiId: params.fromNotiId,
        size: params.size || 5,
        gtNotiId,
      })
      return response.notifications || []
    },
  })

  return { loadMoreMutation }
}
