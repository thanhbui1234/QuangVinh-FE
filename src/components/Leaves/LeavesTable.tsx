import React from 'react'
import { Card } from '@/components/ui/card.tsx'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { TableBase } from '@/components/base/DataTable'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { formatDate } from '@/utils/CommonUtils.ts'
import {
  getLeaveIcon,
  type LeavesListDataResponse,
  MappingLeavesType,
  mapDayOffType,
  StatusLeaves,
  DaysOffType,
  LeavesType,
} from '@/types/Leave.ts'

type LeavesTableProps = {
  data: LeavesListDataResponse[]
  canApprove: boolean
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  total?: number
  hasMore?: boolean
  loading?: boolean
  onActionClick: (id: string, action: 'approve' | 'reject') => void
  onViewDetails: (request: LeavesListDataResponse) => void
  onEdit?: (request: LeavesListDataResponse) => void
  onDelete?: (request: LeavesListDataResponse) => void
  canEditOrDelete?: (request: LeavesListDataResponse) => any
  onOpenCalendar?: () => void
}

const LeavesTable: React.FC<LeavesTableProps> = (props) => {
  const {
    data,
    canApprove,
    currentPage,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    total,
    hasMore = false,
    loading = false,
    onActionClick,
    onViewDetails,
    onEdit,
    onDelete,
    canEditOrDelete,
    onOpenCalendar,
  } = props

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'creator',
      key: 'employeeName',
      sorter: true,
      filterable: true,
      filterType: 'text',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={record.creator?.avatar} alt={record.creator?.name} />
            <AvatarFallback>{record.creator?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="font-medium">
            {record.creator?.name || record.creator?.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại nghỉ',
      dataIndex: 'absenceType',
      key: 'type',
      sorter: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(MappingLeavesType).map(([key, value]) => ({
        label: value,
        value: key,
      })),
      render: (value: any) => {
        const Icon = getLeaveIcon(value)
        return (
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span>{MappingLeavesType[value as LeavesType] || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      title: 'Chế độ nghỉ',
      dataIndex: 'dayOffType',
      key: 'dayOffType',
      sorter: true,
      render: (value: number) => <span>{value ? mapDayOffType[value as DaysOffType] : 'N/A'}</span>,
    },
    {
      title: 'Từ ngày',
      dataIndex: 'offFrom',
      key: 'startDate',
      sorter: true,
      filterable: true,
      filterType: 'date',
      render: (value: any) => formatDate(value),
    },
    {
      title: 'Đến ngày',
      dataIndex: 'offTo',
      key: 'endDate',
      sorter: true,
      filterable: true,
      filterType: 'date',
      render: (value: any) => formatDate(value),
    },
    {
      title: 'Số ngày',
      dataIndex: 'dayO    ff',
      key: 'days',
      sorter: true,
      render: (value: any) => {
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{value}</span>
          </div>
        )
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (value: any) => (
        <div className="max-w-[200px] truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Chờ duyệt', value: StatusLeaves.PENDING.toString() },
        { label: 'Đã duyệt', value: StatusLeaves.APPROVED.toString() },
        { label: 'Từ chối', value: StatusLeaves.REJECTED.toString() },
      ],
      render: (value: any) => {
        if (value === StatusLeaves.PENDING)
          return (
            <Badge variant="secondary" className="gap-1.5">
              <AlertCircle className="size-3" />
              Chờ duyệt
            </Badge>
          )
        if (value === StatusLeaves.APPROVED)
          return (
            <Badge className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
              <CheckCircle2 className="size-3" />
              Đã duyệt
            </Badge>
          )
        if (value === StatusLeaves.REJECTED)
          return (
            <Badge className="gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0">
              <XCircle className="size-3" />
              Từ chối
            </Badge>
          )
        return null
      },
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      key: 'actions',
      align: 'left',
      render: (_: any, record: any) => {
        const hasActions =
          canApprove ||
          record.status === StatusLeaves.PENDING ||
          onViewDetails ||
          onEdit ||
          onDelete

        if (!hasActions) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(record)}>
                  <Eye className="size-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>
              )}
              {canApprove && record.status === StatusLeaves.PENDING && (
                <>
                  <DropdownMenuItem onClick={() => onActionClick(record.id.toString(), 'approve')}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Duyệt đơn
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onActionClick(record.id.toString(), 'reject')}
                    variant="destructive"
                  >
                    <XCircle className="size-4 mr-2" />
                    Từ chối đơn
                  </DropdownMenuItem>
                </>
              )}
              {record.status === StatusLeaves.PENDING &&
                canEditOrDelete &&
                canEditOrDelete(record) && (
                  <>
                    {onEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="size-4 mr-2" />
                          Sửa đơn
                        </DropdownMenuItem>
                      </>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(record)} variant="destructive">
                        <Trash2 className="size-4 mr-2" />
                        Xoá đơn
                      </DropdownMenuItem>
                    )}
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <Card className="p-6 rounded-xl border-muted shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="size-5" />
            Danh sách đơn xin nghỉ
          </h2>
          {onOpenCalendar && (
            <Button variant="outline" size="sm" onClick={onOpenCalendar} className="gap-2">
              <Calendar className="size-4" />
              Xem lịch nghỉ phép tuần
            </Button>
          )}
        </div>

        <TableBase
          dataSource={data}
          columns={columns as any}
          loading={loading}
          searchable={true}
          searchPlaceholder="Tìm kiếm theo tên nhân viên, lý do..."
          filterable={true}
          columnVisibility={true}
          rowKey="id"
          pagination={{
            showQuickJumper: false,
            current: currentPage || 1,
            pageSize: pageSize,
            total: hasMore ? (total || data.length) + 1 : total || data.length,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} mục`,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: onPageChange,
            onShowSizeChange: onPageSizeChange ? (_, size) => onPageSizeChange(size) : undefined,
          }}
          size="middle"
          bordered={true}
          striped
          emptyText="Chưa có đơn xin nghỉ nào"
        />
      </Card>
    </>
  )
}
export default LeavesTable
