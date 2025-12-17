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
  1: 'Báo cáo hàng ngày',
  2: 'Hàng hoá - Bảo hành',
  3: 'Hàng hoá - Kiểm kê',
  4: 'Hàng hoá - Nhập hàng',
  5: 'Hàng hoá - Thiết lập giả',
  6: 'Công nợ NCC',
  7: 'Công nợ khách hàng',
  8: 'Báo cáo nhân sự',
  9: 'Báo cáo đơn hàng',
  10: 'Báo cáo tài chính',
  11: 'Sửa chữa',
  12: 'Marketing',
  13: 'TMDT',
  14: 'Update mã mới',
  15: 'Seller',
  16: 'Các vấn đề phát sinh',
  17: 'Khác',
}

export const TASK_STATUS = {
  CREATED: 1,
  VISIBLE: 2,
  IN_PROGRESS: 8,
  COMPLETED: 9,
  CONFIRM: 11,
  PENDING: 4,
  REJECTED: 12,
} as const

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.CREATED]: 'Đã tạo công việc',
  [TASK_STATUS.IN_PROGRESS]: 'Đã nhận việc/Đang làm',
  [TASK_STATUS.PENDING]: 'Tạm dừng',
  [TASK_STATUS.COMPLETED]: 'Hoàn thành',
  [TASK_STATUS.REJECTED]: 'Đã từ chối',
}

export const TASK_STATUS_FLOW = {
  // Đã tạo công việc -> có thể nhận việc hoặc từ chối
  [TASK_STATUS.CREATED]: [
    { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
    { value: TASK_STATUS.REJECTED, label: TASK_STATUS_LABELS[TASK_STATUS.REJECTED] },
  ],

  // Đã nhận việc/Đang làm -> có thể tạm dừng hoặc hoàn thành
  [TASK_STATUS.IN_PROGRESS]: [
    { value: TASK_STATUS.PENDING, label: TASK_STATUS_LABELS[TASK_STATUS.PENDING] },
    { value: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED] },
  ],

  // Tạm dừng -> có thể tiếp tục làm hoặc từ chối
  [TASK_STATUS.PENDING]: [
    { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
    { value: TASK_STATUS.REJECTED, label: TASK_STATUS_LABELS[TASK_STATUS.REJECTED] },
  ],

  // Hoàn thành -> hết flow
  [TASK_STATUS.COMPLETED]: [],

  // Đã từ chối -> hết flow
  [TASK_STATUS.REJECTED]: [],
}

export type TASK_STATUS_TYPE = keyof typeof TASK_STATUS
