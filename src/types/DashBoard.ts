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

export interface ProjectRatioRequest {
  includeTaskList: boolean
}

export interface ProjectRatioResponse {
  includeTaskList: boolean
  ratio: ProjectRatio
}

export interface ProjectRatio {
  totalTasks: number
  onTimeTasks: number
  delayedTasks: number
  onTimePercentage: number
  delayedPercentage: number
  onTimeTaskList: TaskItem[]
  delayedTaskList: TaskItem[]
}

export interface TaskItem {
  id: string
  title: string
  projectName?: string
  assignee?: UserInfo
  dueDate?: number
  status?: number
  priority?: number
}

export interface ProjectProgressDayRequest {
  startDate: number
  endDate: number
}

export interface ProjectProgressDayResponse {
  startDate: number
  endDate: number
  progress: ProjectProgress
}

export interface ProjectProgress {
  startDate: number
  endDate: number
  dailyProgress: DailyProgress[]
}

export interface DailyProgress {
  date: string
  dayOfWeek: string
  completedTaskCount: number
  tasks: ProgressTask[]
}

export interface ProgressTask {
  taskId: number
  description: string
  status: number
  priority: number
  groupId: number
  doneTime: number
  creator: ProgressUser
  assignee: ProgressUser
}

export interface ProgressUser {
  id: number
  email: string
  name: string
}

export interface OverdueTaskRequest {
  limit: number
  offset: number
}

export interface OverdueTaskResponse {
  limit: number
  overdueTasks: OverdueTasksData
}

export interface OverdueTasksData {
  totalOverdueTasks: number
  limit: number
  tasks: OverdueTask[]
}

export interface OverdueTask {
  taskId: number
  description: string
  status: number
  priority: number
  groupId: number
  doneTime: number
  creator: OverdueTaskUser
  supervisor: any
  assignee: OverdueTaskUser
}

export interface OverdueTaskUser {
  id: number
  email?: string
  name: string
}

export interface MyTasksRequest {
  assigneeIds?: number[]
  taskGroupId?: number
  statuses?: number[]
  offset?: number
  limit?: number
  supervisorIds?: number[]
}

export interface MyTasksResponse {
  taskGroupId: number
  statuses: number[]
  assigneeIds: number[]
  offset: number
  limit: number
  tasks: MyTask[]
}

export interface MyTask {
  taskId: number
  description: string
  priority: number
  taskType: number
  status: number
  groupId: number
  groupName: string
  creator: MyTaskUser
  assignee: MyTaskUser
  supervisor?: MyTaskUser
  estimateTime: number
  startTime: number
  createdTime: number
  imageUrls: string[]
  checkList: string
}

export interface MyTaskUser {
  id: number
  name: string
  email?: string
}
