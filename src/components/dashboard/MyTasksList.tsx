import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ClipboardList, Check, X, Briefcase, ShieldCheck } from 'lucide-react'
import { useMyTasksInfinite, type TaskRole } from '@/hooks/dashboard/useMyTasks'
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

interface MyTasksListProps {
  limit?: number
  className?: string
  enabled?: boolean
}

export function MyTasksList({ limit = 5, className = '', enabled = true }: MyTasksListProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TaskRole>('assignee')
  const { tasks, isLoading, handleLoadMore, hasMore, isFetchingMore } = useMyTasksInfinite(
    activeTab,
    limit,
    enabled
  )
  const updateStatusMutation = useUpdateTaskStatus()
  const { userId } = useCheckRole()

  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/assignments`)
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

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ClipboardList className="h-4 w-4" /> Công việc của tôi
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TaskRole)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assignee" className="flex items-center gap-1.5 text-xs">
                <Briefcase className="h-3 w-3" /> Được giao
              </TabsTrigger>
              <TabsTrigger value="supervisor" className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="h-3 w-3" /> Chịu trách nhiệm
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="my-3 opacity-50" />

        {isLoading && tasks.length === 0 ? (
          <div className="space-y-2">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8 bg-muted/20 rounded-lg">
            Không có công việc nào trong danh mục này
          </p>
        ) : (
          <>
            {/* Mobile list (stacked) */}
            <div className="space-y-3 sm:hidden">
              {tasks.map((task) => {
                const isCreatedStatus = task.status === TASK_STATUS.CREATED
                const hasPermission = canManageTask(task)
                const showActions = isCreatedStatus && hasPermission
                const mappedStatus = mapTaskStatus(task.status)

                return (
                  <div
                    key={task.taskId}
                    className="rounded-lg border bg-card p-3 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                    onClick={(e) => handleTaskClick(e)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        T-{task.taskId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`${getStatusClassName(mappedStatus)} text-[10px] px-1.5 py-0`}
                        >
                          {STATUS_LABEL[mappedStatus]}
                        </Badge>
                        {task.estimateTime && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(task.estimateTime).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold line-clamp-2 mb-2">
                      {task.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[100px]">{task.groupName || 'N/A'}</span>
                        <span>•</span>
                        <span className="font-medium text-primary/70">
                          {getTaskPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                    {showActions && (
                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-dashed">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 gap-1 text-[11px] font-medium text-green-600 border-green-200 hover:bg-green-50"
                          onClick={(e) => handleConfirmTask(task.taskId, e)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-3 w-3" />
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 gap-1 text-[11px] font-medium text-red-600 border-red-200 hover:bg-red-50"
                          onClick={(e) => handleRejectTask(task.taskId, e)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Table for >= sm screens */}
            <div className="-mx-3 hidden overflow-x-auto px-3 sm:block">
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isCreatedStatus = task.status === TASK_STATUS.CREATED
                  const hasPermission = canManageTask(task)
                  const showActions = isCreatedStatus && hasPermission
                  const mappedStatus = mapTaskStatus(task.status)

                  return (
                    <div
                      key={task.taskId}
                      className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={(e) => handleTaskClick(e)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            T-{task.taskId}
                          </span>
                          <span className="text-sm font-semibold">{task.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${getStatusClassName(mappedStatus)} px-2 py-0.5`}
                          >
                            <span className="mr-1.5">{STATUS_ICON[mappedStatus]}</span>
                            {STATUS_LABEL[mappedStatus]}
                          </Badge>
                          <Badge variant="secondary" className="font-normal text-[11px]">
                            {getTaskPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{task.groupName || 'N/A'}</span>
                          {task.estimateTime && (
                            <>
                              <span className="text-muted-foreground/30">|</span>
                              <span>
                                Hạn: {new Date(task.estimateTime).toLocaleDateString('vi-VN')}
                              </span>
                            </>
                          )}
                        </div>
                        {showActions && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={(e) => handleConfirmTask(task.taskId, e)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Xác nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleRejectTask(task.taskId, e)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <X className="h-3.5 w-3.5" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {hasMore && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full h-10 text-xs font-semibold rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore || !hasMore}
                >
                  {isFetchingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang tải...
                    </div>
                  ) : (
                    'Xem thêm công việc'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
