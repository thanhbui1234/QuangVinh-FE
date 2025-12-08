import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import SectionTitle from '@/components/dashboard/SectionTitle'
import { ClipboardList } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useMyTasks } from '@/hooks/dashboard/useMyTasks'
import { getTaskPriorityLabel } from '@/utils/getLable'
import { TASK_STATUS } from '@/constants/assignments/task'
import type { MyTask } from '@/types/DashBoard'

// Map numeric status to label
const getStatusLabel = (status: number): string => {
  switch (status) {
    case TASK_STATUS.CREATED:
      return 'Mới tạo'
    case TASK_STATUS.VISIBLE:
      return 'Hiển thị'
    case TASK_STATUS.IN_PROGRESS:
      return 'Đang làm'
    case TASK_STATUS.COMPLETED:
      return 'Hoàn thành'
    default:
      return 'Không xác định'
  }
}

// Map numeric status to badge variant
const getStatusVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return 'default'
    case TASK_STATUS.IN_PROGRESS:
      return 'outline'
    default:
      return 'secondary'
  }
}

interface MyTasksTableProps {
  limit?: number
  className?: string
  enabled?: boolean
}

export function MyTasksTable({ limit = 5, className = '', enabled = true }: MyTasksTableProps) {
  const navigate = useNavigate()
  const { tasks, currentPage, totalPages, isLoading, handlePageChange, hasMore } = useMyTasks(
    1,
    limit,
    enabled
  )

  const handleTaskClick = (task: MyTask) => {
    navigate(`/tasks/${task.taskId}`)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <SectionTitle title="Công việc của tôi" icon={<ClipboardList className="h-4 w-4" />} />
          <Separator className="my-3" />
          <div className="space-y-2">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <SectionTitle title="Công việc của tôi" icon={<ClipboardList className="h-4 w-4" />} />
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground text-center py-4">Không có công việc nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <SectionTitle title="Công việc của tôi" icon={<ClipboardList className="h-4 w-4" />} />
        <Separator className="my-3" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Dự án</TableHead>
              <TableHead>Hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.taskId}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleTaskClick(task)}
              >
                <TableCell className="font-medium">T-{task.taskId}</TableCell>
                <TableCell className="max-w-md truncate">{task.description}</TableCell>
                <TableCell>{task.groupName || 'N/A'}</TableCell>
                <TableCell>
                  {task.estimateTime
                    ? new Date(task.estimateTime).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTaskPriorityLabel(task.priority)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(totalPages > 1 || currentPage > 1) && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage}
                {hasMore ? ` (có thêm)` : ' (hết)'}
              </p>
              <PaginationControl
                currentPage={currentPage}
                totalPages={hasMore ? currentPage + 1 : currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
