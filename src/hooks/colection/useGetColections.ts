import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'

export const useGetColections = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [colectionWorkBoardsKey.getAll],
    queryFn: () =>
      POST(API_ENDPOINT.GET_COLLECTIONS, {
        fromId: 0,
        size: 20,
      }),
    select(data) {
      return data.collections
    },
  })
  return { colections: data, isLoading, error }
}
