import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'

export const useSearchProject = () => {
  const createSearchMutation = useMutation({
    mutationFn: (payload: string) => POST(API_ENDPOINT.SEARCH_PROJECT, { textSearch: payload }),
  })

  return { createSearchMutation }
}
