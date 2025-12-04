import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableBase, type ColumnType } from './TableBase'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin: string
}

const sampleData: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-16',
    lastLogin: '2024-01-19',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'moderator',
    status: 'inactive',
    createdAt: '2024-01-17',
    lastLogin: '2024-01-18',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    role: 'user',
    status: 'pending',
    createdAt: '2024-01-18',
    lastLogin: '2024-01-20',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
  {
    id: '6',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
  {
    id: '7',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
  {
    id: '8',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
  {
    id: '9',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
  {
    id: '10',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-19',
    lastLogin: '2024-01-21',
  },
]

const columns: ColumnType<User>[] = [
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    filterable: true,
    filterType: 'text',
    render: (value) => <div className="font-medium text-foreground">{value}</div>,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true,
    filterable: true,
    filterType: 'text',
    ellipsis: true,
  },
  {
    title: 'Vai trò',
    dataIndex: 'role',
    key: 'role',
    sorter: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Moderator', value: 'moderator' },
    ],
    render: (value) => {
      const roleConfig: Record<
        string,
        { label: string; variant: 'destructive' | 'secondary' | 'outline' }
      > = {
        admin: { label: 'Admin', variant: 'destructive' },
        user: { label: 'User', variant: 'secondary' },
        moderator: { label: 'Moderator', variant: 'outline' },
      }
      const config = roleConfig[value as string]
      return <Badge variant={config.variant}>{config.label}</Badge>
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
      { label: 'Hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' },
      { label: 'Chờ duyệt', value: 'pending' },
    ],
    render: (value) => {
      const statusConfig: Record<
        string,
        { label: string; variant: 'default' | 'secondary' | 'outline' }
      > = {
        active: { label: 'Hoạt động', variant: 'default' },
        inactive: { label: 'Không hoạt động', variant: 'secondary' },
        pending: { label: 'Chờ duyệt', variant: 'outline' },
      }
      const config = statusConfig[value as string]
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
    filterable: true,
    filterType: 'date',
    render: (value) => new Date(value).toLocaleDateString('vi-VN'),
  },
  {
    title: 'Lần đăng nhập cuối',
    dataIndex: 'lastLogin',
    key: 'lastLogin',
    sorter: true,
    render: (value) => new Date(value).toLocaleDateString('vi-VN'),
  },
  {
    title: 'Hành động',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center',
    render: () => (
      <div className="flex gap-2 justify-center">
        <Button size="sm" variant="outline">
          Sửa
        </Button>
        <Button size="sm" variant="destructive">
          Xóa
        </Button>
      </div>
    ),
  },
]

export function TableBaseExample() {
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    console.log('Export data...')
  }

  const handleSearch = (value: string) => {
    console.log('Search:', value)
  }

  const handleRowSelection = (selectedKeys: string[], selectedRows: User[]) => {
    setSelectedRowKeys(selectedKeys)
    console.log('Selected rows:', selectedKeys, selectedRows)
  }

  return (
    <TableBase
      searchable={true}
      searchPlaceholder="Tìm kiếm theo tên hoặc email..."
      dataSource={sampleData}
      columns={columns}
      loading={loading}
      onSearch={handleSearch}
      onRefresh={handleRefresh}
      onExport={handleExport}
      filterable={true}
      columnVisibility={true}
      rowKey="id"
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys,
        onChange: handleRowSelection,
      }}
      pagination={{
        current: 1,
        pageSize: 10,
        total: sampleData.length,
        showSizeChanger: true,
        showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} mục`,
        pageSizeOptions: [5, 10, 20, 50],
      }}
      size="middle"
      bordered={true}
      striped
    />
  )
}

export default TableBaseExample
