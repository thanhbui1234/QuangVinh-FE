import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'

export const useSearchColection = () => {
  const searchColectionMutation = useMutation({
    mutationFn: (payload: string) => POST(API_ENDPOINT.SEARCH_COLLECTION, { textSearch: payload }),
  })

  return { searchColectionMutation }
}
