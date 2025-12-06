import { createQueryKeys } from '@/constants/queryKey'

export const dashboardTeamStatsKey = createQueryKeys<string>('dashboard-team-stats')
export const dashboardOverviewKey = createQueryKeys<string>('dashboard-overview')
export const dashboardProjectRatioKey = createQueryKeys<string>('dashboard-project-ratio')
export const dashboardProjectProgressDayKey = createQueryKeys<string>(
  'dashboard-project-progress-day'
)
export const dashboardOverdueTasksKey = createQueryKeys<string>('dashboard-overdue-tasks')
export const dashboardMyTasksKey = createQueryKeys<string>('dashboard-my-tasks')
