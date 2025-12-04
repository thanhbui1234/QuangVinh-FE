import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { listCommentKey } from '@/constants'

export interface CreateCommentPayload {
  taskId: number
  message: string
  commentType: number
  mentionIds: number[]
}

export const useCreateComment = () => {
  const createCommentMutation = useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      const response = await POST(API_ENDPOINT.CREATE_COMMENT, payload)
      return response
    },
    onSuccess: (_, variables) => {
      const { taskId } = variables
      queryClient.invalidateQueries({
        queryKey: [listCommentKey.detail(taskId.toString()), { taskId }],
      })
    },
  })
  return createCommentMutation
}
