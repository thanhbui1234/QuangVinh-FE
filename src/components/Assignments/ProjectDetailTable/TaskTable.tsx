import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { TableBase } from '@/components/base/DataTable'
import { taskColumns, type TaskRow } from './columns'

type Assignee = { id: string; name: string }

export default function TaskTable(props: {
  tasks: any
  assignees?: Assignee[]
  onDelete?: (id: string) => void
}) {
  const { tasks, assignees, onDelete } = props
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const assigneeIdToName = useMemo(() => {
    if (!assignees) return undefined
    return assignees.reduce<Record<string, string>>((acc, a) => {
      acc[a.id] = a.name
      return acc
    }, {})
  }, [assignees])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <TableBase<TaskRow>
      searchable
      searchPlaceholder="Tìm kiếm theo tiêu đề..."
      dataSource={tasks}
      columns={taskColumns(assigneeIdToName, onDelete)}
      loading={loading}
      onRefresh={handleRefresh}
      filterable
      columnVisibility
      rowKey="id"
      rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }}
      pagination={{
        current: 1,
        pageSize: 10,
        total: tasks.length,
        showSizeChanger: true,
        showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} mục`,
        pageSizeOptions: [5, 10, 20, 50],
      }}
      size="middle"
      bordered
      striped
      onRow={(record) => {
        // Extract only the numeric part from the ID (e.g., 't5' -> '5')
        const numericId = record.id.replace(/\D/g, '')
        return {
          onClick: () => navigate(`/tasks/${numericId}`),
          className: 'cursor-pointer',
        }
      }}
    />
  )
}
