import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useQuery } from '@tanstack/react-query'
import { listDocumentKey } from '@/constants'

export const useGetListDocument = (payload: any) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [listDocumentKey.list],
    queryFn: () => POST(API_ENDPOINT.GET_DOCUMENTS, { ...payload }),
    select(data) {
      return data.documents
    },
  })
  return { documents: data, isFetching, error }
}
