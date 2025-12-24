import { useState } from 'react'
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
import { ClipboardList, Check, X, Briefcase, ShieldCheck } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useMyTasks, type TaskRole } from '@/hooks/dashboard/useMyTasks'
import { useUpdateTaskStatus } from '@/hooks/dashboard/useUpdateTaskStatus'
import useCheckRole from '@/hooks/useCheckRole'
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL, STATUS_ICON } from '@/components/Assignments/ProjectDetailTable/columns'
import { TASK_STATUS } from '@/constants/assignments/task'
import type { MyTask } from '@/types/DashBoard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [activeTab, setActiveTab] = useState<TaskRole>('assignee')
  const { tasks, currentPage, totalPages, isLoading, handlePageChange, hasMore } = useMyTasks(
    activeTab,
    1,
    limit,
    enabled
  )
  const updateStatusMutation = useUpdateTaskStatus()
  const { userId } = useCheckRole()

  const handleTaskClick = (task: MyTask, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/tasks/${task.taskId}`)
  }

  const canManageTask = (task: MyTask) => {
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2 mt-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">Không có công việc nào</p>
      )
    }

    return (
      <div className="flex-1 overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Mã</TableHead>
              <TableHead>Tên công việc</TableHead>
              <TableHead>Dự án</TableHead>
              <TableHead>Hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isCreatedStatus = task.status === TASK_STATUS.CREATED
              const hasPermission = canManageTask(task)
              const showActions = isCreatedStatus && hasPermission
              const mappedStatus = mapTaskStatus(task.status)

              return (
                <TableRow
                  key={task.taskId}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={(e) => handleTaskClick(task, e)}
                >
                  <TableCell className="font-mono text-xs font-semibold">{task.taskId}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate font-medium" title={task.description}>
                      {task.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-1.5 cursor-pointer group/project min-w-[120px]"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (task.groupId) navigate(`/assignments/${task.groupId}`)
                      }}
                    >
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70 group-hover/project:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover/project:text-primary group-hover/project:underline transition-colors truncate max-w-[150px]">
                        {task.groupName || '--'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm whitespace-nowrap">
                      {task.estimateTime
                        ? new Date(task.estimateTime).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusClassName(mappedStatus)} px-2 py-0.5 whitespace-nowrap`}
                    >
                      <span className="mr-1.5">{STATUS_ICON[mappedStatus]}</span>
                      {STATUS_LABEL[mappedStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal whitespace-nowrap">
                      {getTaskPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {showActions ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => handleConfirmTask(task.taskId, e)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleRejectTask(task.taskId, e)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">--</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Card
      className={`${className} flex flex-col h-full border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm`}
    >
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <SectionTitle
            title="Quản lý công việc"
            icon={<ClipboardList className="h-5 w-5 text-primary" />}
          />

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as TaskRole)
              handlePageChange(1) // Reset to page 1 when switching tabs
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="assignee" className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                Được giao
              </TabsTrigger>
              <TabsTrigger value="supervisor" className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Chịu trách nhiệm
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="opacity-50" />

        {renderContent()}

        {(totalPages > 1 || currentPage > 1) && !isLoading && tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground font-medium">
              Đang hiển thị trang {currentPage}
              {hasMore ? ` (còn tiếp)` : ' (hết danh sách)'}
            </p>
            <PaginationControl
              currentPage={currentPage}
              totalPages={hasMore ? currentPage + 1 : currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
