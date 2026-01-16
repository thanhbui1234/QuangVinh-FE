import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { TableBase } from '@/components/base/DataTable'
import { taskColumns, type TaskRow } from './columns'
import { motion } from 'framer-motion'

type Supervisor = { id: string; name: string }

export default function TaskTable(props: {
  tasks: any
  supervisors?: Supervisor[]
  onDelete?: (id: string) => void
}) {
  const { tasks, supervisors, onDelete } = props
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supervisorIdToName = useMemo(() => {
    if (!supervisors) return undefined
    return supervisors.reduce<Record<string, string>>((acc, s) => {
      acc[s.id] = s.name
      return acc
    }, {})
  }, [supervisors])

  // Reset to page 1 if current page is out of bounds when tasks change
  useEffect(() => {
    const totalPages = Math.ceil(tasks.length / pageSize)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [tasks.length, pageSize, currentPage])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (_: number, size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TableBase<TaskRow>
        searchable
        searchPlaceholder="Tìm kiếm theo tiêu đề..."
        dataSource={tasks}
        columns={taskColumns(supervisorIdToName, onDelete)}
        loading={loading}
        onRefresh={handleRefresh}
        filterable
        columnVisibility
        rowKey="id"
        rowSelection={{ type: 'checkbox', selectedRowKeys, onChange: setSelectedRowKeys }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: tasks.length,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} mục`,
          pageSizeOptions: [5, 10, 20, 50],
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
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
    </motion.div>
  )
}
