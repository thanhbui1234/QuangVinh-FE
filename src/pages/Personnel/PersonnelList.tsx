import { useState } from 'react'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { TableBase, type ColumnType } from '@/components/base/DataTable/TableBase'
import type { User } from '@/types/User'
import type { UserRole } from '@/constants'

// Sample data - sẽ thay bằng API call sau
const samplePersonnel: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    roles: ['DIRECTOR'],
    avatar: undefined,
    phone: '123123312',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '123123312',
    email: 'tranthib@example.com',
    roles: ['MANAGER'],
    avatar: undefined,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
  {
    id: '3',
    phone: '123123312',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    roles: ['WORKER'],
    avatar: undefined,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '4',
    phone: '123123312',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    roles: ['MANAGER', 'WORKER'],
    avatar: undefined,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    phone: '123123312',
    email: 'hoangvane@example.com',
    roles: ['WORKER'],
    avatar: undefined,
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: '6',
    name: 'Võ Thị F',
    email: 'vothif@example.com',
    roles: ['MANAGER'],
    phone: '123123312',
    avatar: undefined,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: '7',
    name: 'Đặng Văn G',
    phone: '123123312',
    email: 'dangvang@example.com',
    roles: ['WORKER'],
    avatar: undefined,
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
  {
    id: '8',
    name: 'Bùi Thị H',
    email: 'buithih@example.com',
    roles: ['DIRECTOR'],
    avatar: undefined,
    phone: '123123312',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
  },
]

const roleLabels: Record<UserRole, string> = {
  DIRECTOR: 'Giám đốc',
  MANAGER: 'Quản lý',
  WORKER: 'Nhân viên',
}

const roleVariants: Record<UserRole, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  DIRECTOR: 'destructive',
  MANAGER: 'default',
  WORKER: 'secondary',
}

const PersonnelList = () => {
  const [loading, setLoading] = useState(false)
  const [data] = useState<User[]>(samplePersonnel)

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    console.log('Export personnel data...')
    // TODO: Implement export functionality
  }

  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // TODO: Implement search functionality
  }

  const handleView = (userId: string) => {
    console.log('View user:', userId)
    // TODO: Navigate to user profile
  }

  const handleEdit = (userId: string) => {
    console.log('Edit user:', userId)
    // TODO: Open edit modal
  }

  const handleDelete = (userId: string) => {
    console.log('Delete user:', userId)
    // TODO: Implement delete functionality
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const columns: ColumnType<User>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: true,
      filterable: true,
      filterType: 'text',
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {record.avatar ? <AvatarImage src={record.avatar} alt={value} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(value)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      sorter: true,
      filterable: true,
      filterType: 'text',
      ellipsis: true,
      className: 'hidden md:table-cell',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Giám đốc', value: 'DIRECTOR' },
        { label: 'Quản lý', value: 'MANAGER' },
        { label: 'Nhân viên', value: 'WORKER' },
      ],
      render: (value: UserRole[] | undefined) => {
        if (!value || value.length === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((role) => (
              <Badge key={role} variant={roleVariants[role]}>
                {roleLabels[role]}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      filterable: true,
      filterType: 'date',
      className: 'hidden lg:table-cell',
      render: (value) => {
        return new Date(value).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_value, record) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(record.id)}
            className="h-8 w-8 p-0"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(record.id)}
            className="h-8 w-8 p-0"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(record.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh sách nhân sự</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>
      </div>

      <TableBase
        searchable={true}
        searchPlaceholder="Tìm kiếm theo tên hoặc email..."
        dataSource={data}
        columns={columns}
        loading={loading}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onExport={handleExport}
        filterable={true}
        columnVisibility={true}
        rowKey="id"
        pagination={{
          current: 1,
          pageSize: 10,
          total: data.length,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} nhân viên`,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        size="middle"
        bordered={true}
        striped
        emptyText="Không có nhân viên nào"
      />
    </div>
  )
}

export default PersonnelList
