export interface TeamStatsResponse {
  startDate: number
  endDate: number
  stats: Stats
}

export interface TeamStatsData {
  startDate: number
  endDate: number
  stats: Stats
}

export interface Stats {
  startDate: number
  endDate: number
  dailyStats: DailyStat[]
}

export interface DailyStat {
  date: string
  dayOfWeek: string
  approvedCount: number
  pendingCount: number
  approvedRequests: RequestItem[]
  pendingRequests: RequestItem[]
}

export interface RequestItem {
  id: number
  creator: UserInfo
  approver: UserInfo
  reason: string
  status: number
  dayOff: number
  absenceType: number
  dayOffType: number
  offFrom: number
  offTo: number
}

export interface UserInfo {
  id: number
  name: string
}

export interface TeamStatsRequest {
  startDate: number
  endDate: number
}

export interface DashboardStatsResponse {
  stats: DashboardStats
}

export interface DashboardStats {
  activeTaskGroupCount: number
  activeTaskCount: number
  completedTaskCount: number
  userCount: number

  activeTaskGroupCountChange: number
  activeTaskCountChange: number
  completedTaskCountChange: number
  userCountChange: number
}
