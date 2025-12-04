import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { detailTaskKey } from '@/constants'

export const useGetDetailTask = (id: number) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [detailTaskKey.detail(id.toString()), { taskId: id }],
    queryFn: () => POST(API_ENDPOINT.GET_TASK_DETAIL, { taskId: Number(id) }),
    select(data) {
      return data.task
    },
  })
  return { projectAssignmentDetail: data, isFetching, error }
}
