import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { personnelKey } from '@/constants/personnel/personnel'
import type { GetAllUsersRequest, GetAllUsersResponse, PersonnelUser } from '@/types/Personnel'
import { handleCommonError } from '@/utils/handleErrors'

export const useGetAllUsers = (enabled = true) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery<GetAllUsersResponse>({
    queryKey: personnelKey.getAll,
    queryFn: async () => {
      const payload: GetAllUsersRequest = {
        getAll: true,
      }
      const response = (await POST(API_ENDPOINT.GET_ALL_USER, payload)) as GetAllUsersResponse
      return response
    },
    enabled,
  })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
    }
  }, [error])

  const allUsers: PersonnelUser[] = data?.users ?? []
  const totalUsers = data?.totalUsers ?? 0

  return {
    allUsers,
    totalUsers,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
