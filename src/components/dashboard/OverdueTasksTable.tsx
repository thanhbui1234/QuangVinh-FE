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
import { Clock } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useOverdueTasks } from '@/hooks/dashboard/useOverdueTasks'
import { getTaskPriorityLabel } from '@/utils/getLable'
import { TASK_STATUS } from '@/constants/assignments/task'
import type { OverdueTask } from '@/types/DashBoard'

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

interface OverdueTasksTableProps {
  limit?: number
  className?: string
  enabled?: boolean
}

export function OverdueTasksTable({
  limit = 5,
  className = '',
  enabled = true,
}: OverdueTasksTableProps) {
  const navigate = useNavigate()
  const { tasks, totalOverdueTasks, currentPage, totalPages, isLoading, handlePageChange } =
    useOverdueTasks(1, limit, enabled)

  const handleTaskClick = (task: OverdueTask) => {
    navigate(`/tasks/${task.taskId}`)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <SectionTitle title="Việc quá hạn" icon={<Clock className="h-4 w-4" />} />
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
          <SectionTitle title="Việc quá hạn" icon={<Clock className="h-4 w-4" />} />
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground text-center py-4">
            Không có công việc quá hạn
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <SectionTitle title="Việc quá hạn" icon={<Clock className="h-4 w-4" />} />
        <Separator className="my-3" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Người phụ trách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ưu tiên</TableHead>
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
                <TableCell>{task.assignee?.name || 'Chưa gán'}</TableCell>
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
        {totalPages > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị {tasks.length} / {totalOverdueTasks} công việc
              </p>
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
