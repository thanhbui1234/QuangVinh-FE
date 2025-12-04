export interface Task {
  description: string
  priority: number
  taskType: number
  groupId: number
  assignee?: {
    id: number
    name: string
  }
  status?: number
  startTime?: number
  estimateTime: number
  doneTime?: number
  imageUrls?: string[]
  checkList?: string
}

export interface TaskResponse {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filter: 'all' | 'completed' | 'pending'
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

export interface TaskActions {
  fetchTasks: () => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  setFilter: (filter: TaskState['filter']) => void
  setSortBy: (sortBy: TaskState['sortBy']) => void
  setSortOrder: (sortOrder: TaskState['sortOrder']) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export type TaskStore = TaskState & TaskActions
