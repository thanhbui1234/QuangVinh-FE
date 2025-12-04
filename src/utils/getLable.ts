import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from '@/constants/assignments/task'

export const getTaskPriorityLabel = (id: keyof typeof TASK_PRIORITY_LABELS): string => {
  return TASK_PRIORITY_LABELS[id] ?? 'Không xác định'
}

export const getTaskTypeLabel = (id: keyof typeof TASK_TYPE_LABELS): string => {
  return TASK_TYPE_LABELS[id] ?? 'Không xác định'
}
