import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { projectAssignmentDetailKey } from '@/constants'
import useCheckRole from '@/hooks/useCheckRole'

export interface IUser {
  id: number | string
  name: string
  email?: string
}

export const useGetAllUser = () => {
  const { isDirectorPermission } = useCheckRole()
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: [projectAssignmentDetailKey.getAll],
    queryFn: () => POST(API_ENDPOINT.GET_ALL_USER, { getAll: true }),
    enabled: isDirectorPermission,
    select(data) {
      return data.users as IUser[]
    },
  })
  return { allUser: data, isFetching, isLoading, error }
}
