import React from 'react'
import { Badge } from '@/components/ui/badge'
import { type ColumnType } from '@/components/base/DataTable'
import { CheckCircle2, CircleDashed, Clock4, Pencil, XCircle } from 'lucide-react'
import { getTaskPriorityLabel, getTaskTypeLabel } from '@/utils/getLable'
import { formatEstimateHours } from '@/utils/CommonUtils'

export type TaskRow = {
  id: string
  title: string
  description?: string
  status: any
  priority: number
  taskType: number
  assigneeId?: any
  estimateHours?: number
  groupId?: number
  startTime?: any
  endTime?: any
  estimateTime?: any
}

export const STATUS_LABEL: Record<TaskRow['status'], React.ReactNode> = {
  todo: <span>Cần làm</span>,
  in_progress: <span>Đang làm</span>,
  pending: <span>Đang chờ</span>,
  done: <span>Hoàn thành</span>,
  cancel: <span>Huỷ</span>,
}

export const STATUS_ICON: Record<TaskRow['status'], React.ReactNode> = {
  todo: <Pencil className="w-4 h-4 text-gray-400" />,
  in_progress: <Clock4 className="w-4 h-4 text-gray-400" />,
  pending: <CircleDashed className="w-4 h-4 text-gray-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
  cancel: <XCircle className="w-4 h-4 text-gray-400" />,
}

export const taskColumns = (assigneeIdToName?: Record<string, string>): ColumnType<TaskRow>[] => [
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    sorter: true,
    filterable: true,
    filterType: 'text',
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    filterable: true,
    filterType: 'text',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: STATUS_LABEL.todo, value: 'todo' },
      { label: STATUS_LABEL.in_progress, value: 'in_progress' },
      { label: STATUS_LABEL.pending, value: 'pending' },
      { label: STATUS_LABEL.done, value: 'done' },
      { label: STATUS_LABEL.cancel, value: 'cancel' },
    ],
    render: (value) => {
      const map: Record<
        string,
        {
          label: React.ReactNode
          icon: React.ReactNode
          variant: 'default' | 'secondary' | 'destructive' | 'outline'
        }
      > = {
        todo: { label: STATUS_LABEL.todo, icon: STATUS_ICON.todo, variant: 'secondary' },
        in_progress: {
          label: STATUS_LABEL.in_progress,
          icon: STATUS_ICON.in_progress,
          variant: 'outline',
        },
        pending: { label: STATUS_LABEL.pending, icon: STATUS_ICON.pending, variant: 'outline' },
        done: { label: STATUS_LABEL.done, icon: STATUS_ICON.done, variant: 'default' },
        cancel: { label: STATUS_LABEL.cancel, icon: STATUS_ICON.cancel, variant: 'destructive' },
      }
      const cfg = map[value as string]
      return (
        <Badge variant={cfg.variant}>
          <span className="mr-1">{cfg.icon}</span>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    title: 'Người phụ trách',
    dataIndex: 'assigneeId',
    key: 'assigneeId',
    filterable: true,
    filterType: 'text',
    render: (value) => assigneeIdToName?.[value as string] || value || '-',
  },
  {
    title: 'Ưu tiên',
    dataIndex: 'priority',
    key: 'priority',
    filterable: true,
    filterType: 'text',
    render: (value) => getTaskPriorityLabel(value),
  },
  {
    title: 'Loại công việc',
    dataIndex: 'taskType',
    key: 'taskType',
    filterable: true,
    filterType: 'text',
    render: (value) => getTaskTypeLabel(value),
  },
  {
    title: 'Ước lượng (giờ)',
    dataIndex: 'estimateHours',
    key: 'estimateHours',
    sorter: true,
    align: 'right',
    render: (value) => {
      if (typeof value !== 'number') return '-'
      const isOverdue = value <= 0
      return (
        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
          {formatEstimateHours(value)}
        </span>
      )
    },
  },
]
