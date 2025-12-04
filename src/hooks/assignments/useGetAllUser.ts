import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { projectAssignmentDetailKey } from '@/constants'

export interface IUser {
  id: number | string
  name: string
  email?: string
}

export const useGetAllUser = () => {
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: [projectAssignmentDetailKey.getAll],
    queryFn: () => POST(API_ENDPOINT.GET_ALL_USER, { getAll: true }),
    select(data) {
      return data.users as IUser[]
    },
  })
  return { allUser: data, isFetching, isLoading, error }
}
