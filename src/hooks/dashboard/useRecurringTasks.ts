import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardRecurringTasksKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { MyTasksRequest, MyTasksResponse } from '@/types/DashBoard'

const DEFAULT_LIMIT = 5

export const useRecurringTasks = (initialPage = 1, limit = DEFAULT_LIMIT, enabled = true) => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const offset = (currentPage - 1) * limit

  const { data, isLoading, isFetching, error, refetch } = useQuery<MyTasksResponse>({
    queryKey: dashboardRecurringTasksKey.list({ limit, offset, page: currentPage }),
    queryFn: async () => {
      const payload: MyTasksRequest = {
        limit,
        offset,
        assigneeIds: [],
        isRecurrenceTask: true,
      }
      const response = (await POST(API_ENDPOINT.GET_TASKS, payload)) as MyTasksResponse
      return response
    },
    enabled,
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
