import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TableBase, type ColumnType } from '@/components/base/DataTable/TableBase'
import { useGetAllUsers } from '@/hooks/personnel/useGetAllUsers'
import { PersonnelUserCell } from '@/components/Personnel/PersonnelUserCell'
import { PersonnelRoleBadges } from '@/components/Personnel/PersonnelRoleBadges'
import { PersonnelActions } from '@/components/Personnel/PersonnelActions'
import { PersonnelDetailDialog } from '@/components/Personnel/PersonnelDetailDialog'
import type { PersonnelUser } from '@/types/Personnel'
import { formatTimestampToDate } from '@/utils/CommonUtils'
import type { UserRole } from '@/constants'

const PersonnelList = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedUser, setSelectedUser] = useState<PersonnelUser | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const { allUsers, isLoading, isFetching, refetch } = useGetAllUsers()

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    console.log('Export personnel data...')
    // TODO: Implement export functionality
  }

  const handleSearch = (value: string) => {
    // TableBase handles search internally, this is just for logging if needed
    console.log('Search:', value)
  }

  const handleFilterChange = (filters: Record<string, any>) => {
    // TableBase handles filter internally, this is just for logging if needed
    console.log('Filter changed:', filters)
  }

  const handleView = (userId: string) => {
    const user = allUsers.find((u) => u.id.toString() === userId)
    if (user) {
      setSelectedUser(user)
      setDetailDialogOpen(true)
    }
  }

  const columns: ColumnType<PersonnelUser>[] = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: true,
      filterable: true,
      filterType: 'text',
      render: (value, record) => (
        <PersonnelUserCell name={value} email={record.email} avatar={record.avatar} />
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
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      sorter: true,
      filterable: true,
      filterType: 'text',
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
      render: (value: UserRole[] | undefined) => <PersonnelRoleBadges roles={value} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      sorter: true,
      filterable: true,
      filterType: 'date',
      className: 'hidden lg:table-cell',
      render: (value: number) => formatTimestampToDate(value),
    },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_value, record) => <PersonnelActions userId={record.id} onView={handleView} />,
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
        dataSource={allUsers}
        columns={columns}
        loading={isLoading || isFetching}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onExport={handleExport}
        filterable={true}
        onFilterChange={handleFilterChange}
        columnVisibility={true}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: allUsers.length,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} nhân viên`,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (page, size) => {
            handlePageChange(page)
            if (size) {
              setPageSize(size)
            }
          },
        }}
        size="middle"
        bordered={true}
        striped
        emptyText="Không có nhân viên nào"
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(`/profile/${record.id}`)
            },
            className: 'cursor-pointer hover:bg-gray-50 transition-colors',
          }
        }}
      />

      <PersonnelDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        user={selectedUser}
      />
    </div>
  )
}

export default PersonnelList
