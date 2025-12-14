import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { useInfiniteQuery } from '@tanstack/react-query'
import { listDocumentKey } from '@/constants'
import type { GetDocumentsResponse } from '@/types/Document'

const LIMIT = 4

export const useGetListDocument = (payload: any) => {
  return useInfiniteQuery({
    queryKey: [...listDocumentKey.all, payload],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await POST(API_ENDPOINT.GET_DOCUMENTS, {
        ...payload,
        offset: pageParam,
        limit: LIMIT,
      })
      return res as GetDocumentsResponse
    },

    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.length * LIMIT
      return lastPage.documents?.length === LIMIT ? fetchedCount : undefined
    },

    select(data) {
      return data.pages.flatMap((page) => page.documents)
    },
  })
}
