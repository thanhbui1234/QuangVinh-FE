import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/common/apiEndpoint'
import { dashboardProjectProgressDayKey } from '@/constants/dashboard/dashboard'
import { POST } from '@/core/api'
import type { ProjectProgressDayRequest, ProjectProgressDayResponse } from '@/types/DashBoard'
import {
  calculateWeekRange,
  formatDateRangeShort,
  getDayOfWeekShortLabel,
} from '@/utils/CommonUtils'

export interface DailyProgressChartData {
  dayLabel: string
  completedCount: number
}

export const useProjectProgressDay = (weekOffset = 0, enabled = true) => {
  const range = useMemo(() => calculateWeekRange(weekOffset), [weekOffset])

  const { data, isLoading, isFetching, error, refetch } = useQuery<ProjectProgressDayResponse>({
    queryKey: dashboardProjectProgressDayKey.list(range),
    queryFn: async () => {
      const payload: ProjectProgressDayRequest = { ...range }
      const response = (await POST(
        API_ENDPOINT.DASHBOARD_PROJECT_PROGRESS_DAY,
        payload
      )) as ProjectProgressDayResponse
      return response
    },
    enabled,
  })

  const dailyProgress = data?.progress?.dailyProgress ?? []

  const chartData: DailyProgressChartData[] = useMemo(
    () =>
      dailyProgress.map((day) => ({
        dayLabel: getDayOfWeekShortLabel(day.dayOfWeek),
        completedCount: day.completedTaskCount,
      })),
    [dailyProgress]
  )

  const summary = useMemo(() => {
    return dailyProgress.reduce(
      (acc, day) => {
        acc.totalCompleted += day.completedTaskCount
        acc.totalTasks += day.tasks.length
        return acc
      },
      { totalCompleted: 0, totalTasks: 0 }
    )
  }, [dailyProgress])

  // Flatten all tasks from all days
  const allTasks = useMemo(
    () =>
      dailyProgress.flatMap((day) =>
        day.tasks.map((task) => ({
          ...task,
          date: day.date,
          dayOfWeek: day.dayOfWeek,
        }))
      ),
    [dailyProgress]
  )

  return {
    range,
    rangeLabel: formatDateRangeShort(range.startDate, range.endDate),
    dailyProgress,
    chartData,
    summary,
    allTasks,
    progress: data?.progress,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
