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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import SectionTitle from '@/components/dashboard/SectionTitle'
import { ClipboardList, Check, X } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useMyTasks } from '@/hooks/dashboard/useMyTasks'
import { useUpdateTaskStatus } from '@/hooks/dashboard/useUpdateTaskStatus'
import useCheckRole from '@/hooks/useCheckRole'
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL, STATUS_ICON } from '@/components/Assignments/ProjectDetailTable/columns'
import { TASK_STATUS } from '@/constants/assignments/task'
import type { MyTask } from '@/types/DashBoard'

// Map task status to color classes
const getStatusClassName = (
  status: 'todo' | 'in_progress' | 'pending' | 'done' | 'rejected'
): string => {
  const statusClassMap: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
    done: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  }
  return statusClassMap[status] || statusClassMap.todo
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
  const updateStatusMutation = useUpdateTaskStatus()
  const { userId } = useCheckRole()

  const handleTaskClick = (task: MyTask, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/tasks/${task.taskId}`)
  }

  const canManageTask = (task: MyTask) => {
    // Chỉ supervisor hoặc creator mới được xác nhận/từ chối
    const isSupervisor = task.supervisor?.id === userId
    const isCreator = task.creator?.id === userId
    return isSupervisor || isCreator
  }

  const handleConfirmTask = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    updateStatusMutation.mutate({
      taskId,
      newStatus: TASK_STATUS.IN_PROGRESS,
    })
  }

  const handleRejectTask = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    updateStatusMutation.mutate({
      taskId,
      newStatus: TASK_STATUS.REJECTED,
    })
  }

  if (isLoading) {
    return (
      <Card className={`${className} flex flex-col h-full`}>
        <CardContent className="p-4 flex flex-col flex-1">
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
      <Card className={`${className} flex flex-col h-full`}>
        <CardContent className="p-4 flex flex-col flex-1">
          <SectionTitle title="Công việc của tôi" icon={<ClipboardList className="h-4 w-4" />} />
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground text-center py-4">Không có công việc nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} flex flex-col h-full`}>
      <CardContent className="p-4 flex flex-col flex-1">
        <SectionTitle title="Công việc của tôi" icon={<ClipboardList className="h-4 w-4" />} />
        <Separator className="my-3" />
        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Dự án</TableHead>
                <TableHead>Hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Độ ưu tiên</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isCreatedStatus = task.status === TASK_STATUS.CREATED
                const hasPermission = canManageTask(task)
                const showActions = isCreatedStatus && hasPermission
                return (
                  <TableRow
                    key={task.taskId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => handleTaskClick(task, e)}
                  >
                    <TableCell className="font-medium">{task.taskId}</TableCell>
                    <TableCell className="max-w-md truncate">{task.description}</TableCell>
                    <TableCell>{task.groupName || '--'}</TableCell>
                    <TableCell>
                      {task.estimateTime
                        ? new Date(task.estimateTime).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const mappedStatus = mapTaskStatus(task.status)
                        return (
                          <Badge variant="outline" className={getStatusClassName(mappedStatus)}>
                            <span className="mr-1.5">{STATUS_ICON[mappedStatus]}</span>
                            {STATUS_LABEL[mappedStatus]}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTaskPriorityLabel(task.priority)}</Badge>
                    </TableCell>
                    <TableCell>
                      {showActions ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 gap-1 text-xs font-medium text-green-700 hover:text-green-800 hover:bg-green-50"
                            onClick={(e) => handleConfirmTask(task.taskId, e)}
                            disabled={updateStatusMutation.isPending}
                            title="Xác nhận công việc"
                          >
                            <Check className="h-3 w-3" />
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 gap-1 text-xs font-medium text-red-700 hover:text-red-800 hover:bg-red-50"
                            onClick={(e) => handleRejectTask(task.taskId, e)}
                            disabled={updateStatusMutation.isPending}
                            title="Từ chối công việc"
                          >
                            <X className="h-3 w-3" />
                            Từ chối
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
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
