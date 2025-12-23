import { useState, useMemo } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardMyTasksKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { MyTasksRequest, MyTasksResponse } from '@/types/DashBoard'
import useCheckRole from '@/hooks/useCheckRole'

const DEFAULT_LIMIT = 5

export type TaskRole = 'assignee' | 'supervisor'

// Hook for web with pagination
export const useMyTasks = (
  role: TaskRole = 'assignee',
  initialPage = 1,
  limit = DEFAULT_LIMIT,
  enabled = true
) => {
  const { userId } = useCheckRole()
  const [currentPage, setCurrentPage] = useState(initialPage)

  const offset = (currentPage - 1) * limit

  const { data, isLoading, isFetching, error, refetch } = useQuery<MyTasksResponse>({
    queryKey: dashboardMyTasksKey.list({ role, limit, offset, page: currentPage, userId }),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const payload: MyTasksRequest = {
        limit,
        offset,
      }

      if (role === 'assignee') {
        payload.assigneeIds = [userId]
      } else {
        payload.supervisorIds = [userId]
      }

      const response = (await POST(API_ENDPOINT.GET_TASKS, payload)) as MyTasksResponse
      return response
    },
    enabled: enabled && !!userId,
  })

  const tasks = data?.tasks ?? []
  const hasMore = tasks.length === limit
  const totalPages = hasMore ? currentPage + 1 : currentPage

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return {
    tasks,
    currentPage,
    totalPages,
    limit,
    isLoading,
    isFetching,
    error,
    refetch,
    handlePageChange,
    hasMore,
  }
}

// Hook for mobile with load more (infinite scroll)
export const useMyTasksInfinite = (
  role: TaskRole = 'assignee',
  limit = DEFAULT_LIMIT,
  enabled = true
) => {
  const { userId } = useCheckRole()

  const { data, isLoading, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<MyTasksResponse>({
      queryKey: dashboardMyTasksKey.list({ role, limit, userId, mode: 'infinite' }),
      queryFn: async ({ pageParam = 0 }) => {
        if (!userId) {
          throw new Error('User ID is required')
        }
        const payload: MyTasksRequest = {
          limit,
          offset: pageParam ? Number(pageParam) : 0,
        }

        if (role === 'assignee') {
          payload.assigneeIds = [userId]
        } else {
          payload.supervisorIds = [userId]
        }

        const response = (await POST(API_ENDPOINT.GET_TASKS, payload)) as MyTasksResponse
        return response
      },
      getNextPageParam: (lastPage, allPages) => {
        const currentPageItems = lastPage.tasks?.length || 0
        const totalFetched = allPages.reduce((sum, page) => sum + (page.tasks?.length || 0), 0)

        // If current page has fewer items than limit, it's the last page
        if (currentPageItems < limit) {
          return undefined
        }

        // Return the next offset
        return totalFetched
      },
      initialPageParam: 0,
      enabled: enabled && !!userId,
    })

  // Flatten all pages into a single array
  const tasks = useMemo(() => data?.pages.flatMap((page) => page.tasks || []) || [], [data?.pages])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  return {
    tasks,
    isLoading,
    isFetching,
    error,
    handleLoadMore,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
  }
}
