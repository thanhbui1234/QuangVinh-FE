import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'

export const useGetDetailColection = (id: number) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [colectionWorkBoardsKey.detail(id.toString()), { collectionId: id }],
    queryFn: () => POST(API_ENDPOINT.GET_COLLECTION_DETAIL, { collectionId: Number(id) }),
    select: (data) => {
      return data.collection
    },
  })

  return { collectionDetail: data, isFetching, error }
}
