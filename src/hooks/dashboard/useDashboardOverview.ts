import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardOverviewKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { DashboardStatsResponse } from '@/types/DashBoard'

export const useDashboardOverview = (enabled = true) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery<DashboardStatsResponse>({
    queryKey: dashboardOverviewKey.list({}),
    queryFn: async () => {
      const payload = {}
      const response = (await POST(
        API_ENDPOINT.DASHBOARD_OVERVIEW,
        payload
      )) as DashboardStatsResponse
      return response
    },
    enabled,
  })

  const stats = data?.stats
  return {
    stats,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
