import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS, TASK_STATUS } from '@/constants/assignments/task'

export type TaskStatus = 'todo' | 'in_progress' | 'pending' | 'done' | 'rejected'

export const getTaskPriorityLabel = (id: keyof typeof TASK_PRIORITY_LABELS): string => {
  return TASK_PRIORITY_LABELS[id] ?? 'Không xác định'
}

export const getTaskTypeLabel = (id: keyof typeof TASK_TYPE_LABELS): string => {
  return TASK_TYPE_LABELS[id] ?? 'Không xác định'
}

// Map API task status number to TaskStatus
export function mapTaskStatus(statusCode: number): TaskStatus {
  switch (statusCode) {
    case TASK_STATUS.CREATED:
      return 'todo'
    case TASK_STATUS.IN_PROGRESS:
      return 'in_progress'
    case TASK_STATUS.PENDING:
      return 'pending'
    case TASK_STATUS.COMPLETED:
      return 'done'
    case TASK_STATUS.REJECTED:
      return 'rejected'
    default:
      return 'todo'
  }
}
