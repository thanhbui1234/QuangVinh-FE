import { useInfiniteQuery } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import { handleCommonError } from '@/utils/handleErrors'
import { useEffect } from 'react'
import type { GetSnapshotSheetListResponse } from '@/types/Sheet'

interface UseGetSheetListParams {
  textSearch?: string
  size?: number
}

export const useGetSheetList = ({ textSearch = '', size = 20 }: UseGetSheetListParams = {}) => {
  const { data, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GetSnapshotSheetListResponse>({
      queryKey: ['sheet-list-infinite', { textSearch, size }],
      initialPageParam: 0 as number,
      queryFn: async ({ pageParam }) => {
        return await POST(API_ENDPOINT.GET_SNAPSHOT_SHEET_LIST, {
          fromId: pageParam,
          size,
          textSearch,
        })
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage?.snapshotSheets?.length) return undefined
        if (lastPage.snapshotSheets.length < size) return undefined
        const lastItem = lastPage.snapshotSheets[lastPage.snapshotSheets.length - 1]
        return lastItem.id
      },
    })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
    }
  }, [error])

  // Flatten the pages into a single array of sheets
  const sheets = data?.pages.flatMap((page) => page.snapshotSheets) ?? []

  return {
    sheets,
    isLoading: isFetching,
    error,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  }
}
