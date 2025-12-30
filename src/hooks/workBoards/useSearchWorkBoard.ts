import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'

export const useSearchWorkBoard = () => {
  const createSearchMutation = useMutation({
    mutationFn: (payload: string) => POST(API_ENDPOINT.SEARCH_WORKBOARD, { textSearch: payload }),
  })

  return { createSearchMutation }
}
