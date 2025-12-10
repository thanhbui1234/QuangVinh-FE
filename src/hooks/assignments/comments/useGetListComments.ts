import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { listCommentKey } from '@/constants'

export interface CommentUser {
  id: number
  email: string
  name: string
  avatar?: string
}

export interface Comment {
  commentId: number
  taskId: number
  message: string
  imageUrls: string[]
  commentType: number
  status: number
  creator: CommentUser
  mentionUsers: Array<{
    id: number
    email: string
    name: string
  }>
  createdTime: number
  updatedTime: number
}

interface GetListCommentsResponse {
  comments: Comment[]
}

export const useGetListComments = (taskId: number) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [listCommentKey.detail(taskId.toString()), { taskId }],
    queryFn: async () => {
      const response = await POST(API_ENDPOINT.GET_LIST_COMMENT, {
        taskIds: [taskId],
        fromId: 0,
        limit: 50,
      })

      return response as GetListCommentsResponse
    },
    select(data) {
      return data?.comments || []
    },
    refetchInterval: () => {
      return 5_000
    },
    refetchIntervalInBackground: true,
    enabled: !!taskId && taskId > 0,
  })

  return { comments: data || [], isFetching, error }
}
