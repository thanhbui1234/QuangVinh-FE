import React from 'react'
import { Badge } from '@/components/ui/badge'
import { type ColumnType } from '@/components/base/DataTable'
import { CheckCircle2, CircleDashed, Clock4, Pencil } from 'lucide-react'
import { getTaskPriorityLabel, getTaskTypeLabel } from '@/utils/getLable'
import { formatEstimateHours } from '@/utils/CommonUtils'
import { Button } from '@/components/ui/button'
export type TaskRow = {
  id: string
  title: string
  description?: string
  status: any
  priority: number
  taskType: number
  assigneeId?: any
  supervisorId?: string
  supervisor?: {
    id: number
    name: string
    email?: string
    avatar?: string
  }
  estimateHours?: number
  groupId?: number
  startTime?: any
  endTime?: any
  estimateTime?: any
}

export const STATUS_LABEL: Record<TaskRow['status'], React.ReactNode> = {
  todo: <span>Bắt đầu</span>,
  visible: <span>Đã nhận việc</span>,
  in_progress: <span>Đang làm / chờ</span>,
  done: <span>Đã hoàn thành</span>,
}

export const STATUS_ICON: Record<TaskRow['status'], React.ReactNode> = {
  todo: <Pencil className="w-4 h-4 text-gray-400" />,
  visible: <CircleDashed className="w-4 h-4 text-gray-400" />,
  in_progress: <Clock4 className="w-4 h-4 text-gray-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
}

export const taskColumns = (
  supervisorIdToName?: Record<string, string>,
  onDelete?: (id: string) => void
): ColumnType<TaskRow>[] => [
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
    render: (value) => {
      if (!value) return <span className="text-gray-400">—</span>
      return (
        <div
          className="text-xs text-gray-700 leading-snug line-clamp-2 max-w-md"
          dangerouslySetInnerHTML={{ __html: String(value) }}
        />
      )
    },
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
      { label: STATUS_LABEL.visible, value: 'visible' },
      { label: STATUS_LABEL.in_progress, value: 'in_progress' },
      { label: STATUS_LABEL.done, value: 'done' },
    ],
    render: (value) => {
      const map: Record<
        string,
        {
          label: React.ReactNode
          icon: React.ReactNode
          className: string
        }
      > = {
        todo: {
          label: STATUS_LABEL.todo,
          icon: STATUS_ICON.todo,
          className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
        },
        visible: {
          label: STATUS_LABEL.visible,
          icon: STATUS_ICON.visible,
          className: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
        },
        2: {
          label: STATUS_LABEL.visible,
          icon: STATUS_ICON.visible,
          className: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
        },
        in_progress: {
          label: STATUS_LABEL.in_progress,
          icon: STATUS_ICON.in_progress,
          className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
        },
        done: {
          label: STATUS_LABEL.done,
          icon: STATUS_ICON.done,
          className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
        },
      }
      const cfg = map[value as string]
      if (!cfg) return <span className="text-gray-400">—</span>
      return (
        <Badge variant="outline" className={cfg.className}>
          <span className="mr-1.5">{cfg.icon}</span>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    title: 'Người chịu trách nhiệm',
    dataIndex: 'supervisor',
    key: 'supervisor',
    filterable: true,
    filterType: 'text',
    render: (value, record) => {
      // Prefer direct supervisor object if available
      if (value && typeof value === 'object' && 'name' in value) {
        return value.name || value.email || '-'
      }
      // Fallback to supervisorId lookup
      if (record.supervisorId && supervisorIdToName) {
        return supervisorIdToName[record.supervisorId] || '-'
      }
      return '-'
    },
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
  {
    title: 'Thao tác',
    dataIndex: 'action',
    key: 'action',
    render: (_, record) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            className="h4"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(record.id)
            }}
            variant="destructive"
          >
            Xoá
          </Button>
        </div>
      )
    },
  },
]
