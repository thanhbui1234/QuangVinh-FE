import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardProjectRatioKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { ProjectRatioRequest, ProjectRatioResponse } from '@/types/DashBoard'

export const useProjectRatio = (includeTaskList = false, enabled = true) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery<ProjectRatioResponse>({
    queryKey: dashboardProjectRatioKey.list({ includeTaskList }),
    queryFn: async () => {
      const payload: ProjectRatioRequest = { includeTaskList }
      const response = (await POST(
        API_ENDPOINT.DASHBOARD_PROJECT_RATIO,
        payload
      )) as ProjectRatioResponse
      return response
    },
    enabled,
  })

  return {
    ratio: data?.ratio,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
