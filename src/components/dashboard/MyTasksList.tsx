import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Briefcase, ShieldCheck } from 'lucide-react'
import { useMyTasksInfinite, type TaskRole } from '@/hooks/dashboard/useMyTasks'
import { useUpdateTaskStatus } from '@/hooks/dashboard/useUpdateTaskStatus'
import useCheckRole from '@/hooks/useCheckRole'
import { mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL } from '@/components/Assignments/ProjectDetailTable/columns'
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

  const handleTaskClick = (taskId: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/tasks/${taskId}`)
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
    <Card className={`${className} overflow-hidden transition-all duration-500`}>
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col gap-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TaskRole)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 rounded-2xl p-1.5 h-auto">
              <TabsTrigger
                value="assignee"
                className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Briefcase className="h-3.5 w-3.5" /> Được giao
              </TabsTrigger>
              <TabsTrigger
                value="supervisor"
                className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Trách nhiệm
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading && tasks.length === 0 ? (
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-24 w-full rounded-3xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 opacity-40">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-widest">Không có công việc nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isCreatedStatus = task.status === TASK_STATUS.CREATED
              const hasPermission = canManageTask(task)
              const showActions = isCreatedStatus && hasPermission
              const mappedStatus = mapTaskStatus(task.status)

              return (
                <div
                  key={task.taskId}
                  className="group relative p-5 rounded-[2.5rem] bg-white/40 dark:bg-card/30 border border-border/5 hover:border-primary/20 hover:bg-white dark:hover:bg-card transition-all duration-300 cursor-pointer overflow-hidden shadow-sm"
                  onClick={(e) => handleTaskClick(task.taskId, e)}
                >
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <ClipboardList className="w-5 h-5 text-primary/60" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black font-mono text-muted-foreground/40">
                            T-{task.taskId}
                          </span>
                          <div
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${getStatusClassName(mappedStatus)}`}
                          >
                            {STATUS_LABEL[mappedStatus]}
                          </div>
                        </div>
                        <h4 className="text-sm font-black text-foreground line-clamp-2 tracking-tight">
                          {task.description}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 opacity-70">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase leading-none">
                          <Briefcase className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">
                            {task.groupName || 'No Board'}
                          </span>
                        </div>
                        {task.estimateTime && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase leading-none">
                            <span className="w-1 h-1 rounded-full bg-red-500 mr-0.5" />
                            {new Date(task.estimateTime).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>

                      {showActions && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 h-9 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                            onClick={(e) => handleConfirmTask(task.taskId, e)}
                            disabled={updateStatusMutation.isPending}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-9 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest"
                            onClick={(e) => handleRejectTask(task.taskId, e)}
                            disabled={updateStatusMutation.isPending}
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {hasMore && (
              <Button
                variant="ghost"
                className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 mt-2 rounded-[2rem] border border-dashed border-border/20"
                onClick={handleLoadMore}
                disabled={isFetchingMore || !hasMore}
              >
                {isFetchingMore ? 'Đang tải...' : 'Xem thêm công việc'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
