import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardOverdueTasksKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { OverdueTaskRequest, OverdueTaskResponse } from '@/types/DashBoard'

const DEFAULT_LIMIT = 5

export const useOverdueTasks = (initialPage = 1, limit = DEFAULT_LIMIT, enabled = true) => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const offset = (currentPage - 1) * limit

  const { data, isLoading, isFetching, error, refetch } = useQuery<OverdueTaskResponse>({
    queryKey: dashboardOverdueTasksKey.list({ limit, offset, page: currentPage }),
    queryFn: async () => {
      const payload: OverdueTaskRequest = { limit, offset }
      const response = (await POST(
        API_ENDPOINT.DASHBOARD_OVERDUE_TASK,
        payload
      )) as OverdueTaskResponse
      return response
    },
    enabled,
  })

  const overdueTasks = data?.overdueTasks
  const totalOverdueTasks = overdueTasks?.totalOverdueTasks ?? 0
  const tasks = overdueTasks?.tasks ?? []
  const totalPages = Math.ceil(totalOverdueTasks / limit)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return {
    tasks,
    totalOverdueTasks,
    currentPage,
    totalPages,
    limit,
    isLoading,
    isFetching,
    error,
    refetch,
    handlePageChange,
  }
}
