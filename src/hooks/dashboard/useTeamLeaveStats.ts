import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardTeamStatsKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type {
  RequestItem,
  TeamStatsData,
  TeamStatsRequest,
  TeamStatsResponse,
} from '@/types/DashBoard'
import {
  calculateWeekRange,
  formatDateRangeShort,
  getDayOfWeekShortLabel,
} from '@/utils/CommonUtils'

type FlattenedRequest = RequestItem & {
  dayOfWeek: string
}

export interface WeeklyLeaveStats {
  dayLabel?: string
  approved: number
  pending: number
}

export const useTeamLeaveStats = (weekOffset = 0, enabled = true) => {
  const range = useMemo(() => calculateWeekRange(weekOffset), [weekOffset])

  const { data, isLoading, isFetching, error, refetch } = useQuery<TeamStatsData>({
    queryKey: dashboardTeamStatsKey.list(range),
    queryFn: async () => {
      const payload: TeamStatsRequest = { ...range }
      const response = (await POST(API_ENDPOINT.DASHBOARD_LEAVES, payload)) as TeamStatsResponse
      return response
    },
    enabled,
  })

  const dailyStats = data?.stats?.dailyStats ?? []

  const chartData: WeeklyLeaveStats[] = useMemo(
    () =>
      dailyStats.map((day) => ({
        dayLabel: getDayOfWeekShortLabel(day.dayOfWeek),
        approved: day.approvedCount,
        pending: day.pendingCount,
      })),
    [dailyStats]
  )

  const summary = useMemo(() => {
    return dailyStats.reduce(
      (acc, day) => {
        acc.approved += day.approvedCount
        acc.pending += day.pendingCount
        return acc
      },
      { approved: 0, pending: 0 }
    )
  }, [dailyStats])

  const pendingRequests: FlattenedRequest[] = useMemo(
    () =>
      dailyStats.flatMap((day) =>
        day.pendingRequests.map((request) => ({
          ...request,
          dayOfWeek: day.dayOfWeek,
        }))
      ),
    [dailyStats]
  )

  const approvedRequests: FlattenedRequest[] = useMemo(
    () =>
      dailyStats.flatMap((day) =>
        day.approvedRequests.map((request) => ({
          ...request,
          dayOfWeek: day.dayOfWeek,
        }))
      ),
    [dailyStats]
  )

  return {
    range,
    rangeLabel: formatDateRangeShort(range.startDate, range.endDate),
    dailyStats,
    chartData,
    summary: {
      ...summary,
      total: summary.approved + summary.pending,
    },
    pendingRequests,
    approvedRequests,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
