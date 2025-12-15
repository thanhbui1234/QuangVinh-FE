import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { memberTaskKey } from '@/constants'

export interface IMemberTask {
  id: number | string
  name: string
  email?: string
}

export const useGetMemberTask = (id: number) => {
  console.log('id123123', id)
  const { data, isFetching, error } = useQuery({
    queryKey: [memberTaskKey.detail(id?.toString())],
    queryFn: () => POST(API_ENDPOINT.GET_MEMBER_TASK, { taskGroupId: id }),
    select(data) {
      return data.users as IMemberTask[]
    },
    enabled: !!id,
  })
  return { memberTask: data, isFetching, error }
}
