export const TASK_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  HIGHEST: 4,
}

export type TASK_PRIORITY_TYPE = keyof typeof TASK_PRIORITY

export const TASK_PRIORITY_LABELS: Record<number, string> = {
  1: 'Thấp',
  2: 'Trung bình',
  3: 'Cao',
  4: 'Rất cao',
}

export const TASK_TYPE = {
  IMPORT_STOCK: 1,
  EXPORT_STOCK: 2,
  INVENTORY_CHECK: 3,
  ORGANIZATION: 4,
  MAINTENANCE: 5,
}

export type TASK_TYPE_TYPE = keyof typeof TASK_TYPE

export const TASK_TYPE_LABELS: Record<number, string> = {
  1: 'Nhập hàng',
  2: 'Xuất hàng',
  3: 'Kiểm kho',
  4: 'Sắp xếp',
  5: 'Bảo trì',
}

export const TASK_STATUS = {
  CREATED: 1,
  VISIBLE: 2,
  IN_PROGRESS: 8,
  COMPLETED: 9,
} as const

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.CREATED]: 'Bắt đầu',
  [TASK_STATUS.VISIBLE]: 'Đã nhận việc',
  [TASK_STATUS.IN_PROGRESS]: 'Đang làm / chờ',
  [TASK_STATUS.COMPLETED]: 'Đã hoàn thành',
}

export const TASK_STATUS_FLOW = {
  [TASK_STATUS.CREATED]: [
    { value: TASK_STATUS.VISIBLE, label: TASK_STATUS_LABELS[TASK_STATUS.VISIBLE] },
  ],

  [TASK_STATUS.VISIBLE]: [
    { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
  ],

  [TASK_STATUS.IN_PROGRESS]: [
    { value: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED] },
  ],

  [TASK_STATUS.COMPLETED]: [], // hết flow
}

export type TASK_STATUS_TYPE = keyof typeof TASK_STATUS
