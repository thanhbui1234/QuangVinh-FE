import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { handleCommonError } from '@/utils/handleErrors'
import { workBoardKey } from '@/constants/workboard/workboard'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import type { GetSnapshotSheetListResponse } from '@/types/Sheet'

interface UseGetWorkBoardsParams {
  textSearch?: string
  size?: number
}

export const useGetWorkBoards = ({ textSearch = '', size = 10 }: UseGetWorkBoardsParams = {}) => {
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, error } =
    useInfiniteQuery<GetSnapshotSheetListResponse>({
      queryKey: workBoardKey.list({ textSearch, size }),
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
      placeholderData: (previousData) => previousData,
    })

  useEffect(() => {
    if (error) {
      handleCommonError(error)
    }
  }, [error])

  const workBoards = data?.pages.flatMap((page) => page.snapshotSheets) ?? []

  return {
    workBoards,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    error,
  }
}
