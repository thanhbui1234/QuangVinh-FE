import { projectsAssignmentsKey } from '@/constants/assignments/assignment'
import { POST } from '@/core/api'
import { useInfiniteQuery } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import type { getProjectListParams } from '@/types/project'
import { useEffect } from 'react'
import { handleCommonError } from '@/utils/handleErrors'

type UseGetProjectListParams = Omit<getProjectListParams, 'offset'>

export const useGetProjectList = (payload: UseGetProjectListParams) => {
  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: [projectsAssignmentsKey.getAll],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await POST(API_ENDPOINT.GET_PROJECTS, {
          ...payload,
          offset: pageParam,
        })
        return response
      },
      getNextPageParam: (lastPage, allPages) => {
        const currentPageItems = lastPage.taskGroups?.length || 0
        const totalFetched = allPages.length * payload.limit
        const total = lastPage.total || 0
        // If current page has no items, we're done
        if (currentPageItems === 0) {
          return undefined
        }
        // If we have a valid total from API, use it
        if (total > 0 && totalFetched >= total) {
          return undefined
        }

        // If current page has fewer items than limit, it's the last page
        if (currentPageItems < payload.limit) {
          return undefined
        }
        // Current page is full, there might be more pages
        return totalFetched
      },
      initialPageParam: 0,
    })

  // Flatten all pages into a single array
  const projectsAssignments = data?.pages.flatMap((page) => page.taskGroups || []) || []
  const total = data?.pages[0]?.total || 0
  const totalPages = data?.pages[0]?.totalPages || 0

  useEffect(() => {
    if (error) {
      console.log('error', error)
      handleCommonError(error)
    }
  }, [error])
  return {
    projectsAssignments,
    total,
    totalPages,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}
