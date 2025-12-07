import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { listCommentKey } from '@/constants'

export interface UpdateCommentPayload {
  commentId: number
  message?: string
  imageUrls?: string[]
  commentType?: number
  mentionIds?: number[]
  taskId: number
}

export const useUpdateComment = ({ taskId }: { taskId: number }) => {
  const updateCommentMutation = useMutation({
    mutationFn: async (payload: UpdateCommentPayload) => {
      const response = await POST(API_ENDPOINT.UPDATE_COMMENT, payload)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [listCommentKey.detail(taskId.toString()), { taskId }],
      })
    },
  })
  return updateCommentMutation
}
