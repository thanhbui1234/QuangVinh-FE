import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { listCommentKey } from '@/constants'
import { queryClient } from '@/lib/queryClient'

export const useRemoveComment = ({ taskId }: { taskId: number }) => {
  const removeCommentMutation = useMutation({
    mutationFn: async (payload: number) => {
      const response = await POST(API_ENDPOINT.REMOVE_COMMENT, { commentId: payload })
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [listCommentKey.detail(taskId.toString()), { taskId }],
      })
    },
  })

  return removeCommentMutation
}
