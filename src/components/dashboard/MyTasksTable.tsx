import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Check, X, Briefcase, ShieldCheck } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useMyTasks, type TaskRole } from '@/hooks/dashboard/useMyTasks'
import { useUpdateTaskStatus } from '@/hooks/dashboard/useUpdateTaskStatus'
import useCheckRole from '@/hooks/useCheckRole'
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
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
        <div className="grid grid-cols-1 gap-4 mt-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-24 w-full rounded-[2rem] bg-white/40 dark:bg-card/40 border border-white/20 animate-pulse"
            />
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <ClipboardList className="w-10  h-10 text-muted-foreground" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Không có công việc nào
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 mt-8">
        {tasks.map((task) => {
          const isCreatedStatus = task.status === TASK_STATUS.CREATED
          const hasPermission = canManageTask(task)
          const showActions = isCreatedStatus && hasPermission
          const mappedStatus = mapTaskStatus(task.status)

          return (
            <div
              key={task.taskId}
              onClick={(e) => handleTaskClick(task, e)}
              className="group relative flex flex-col sm:flex-row gap-5 p-5 rounded-[2.5rem] bg-white/40 dark:bg-card/30 border border-border/5 hover:border-primary/20 hover:bg-white dark:hover:bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden"
            >
              {/* Task Icon/Status Indicator */}
              <div className="shrink-0 flex sm:flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                  <ClipboardList className="w-6 h-6 text-primary/60" />
                </div>
                <div className="sm:hidden flex-1 border-b border-border/5" />
                <span className="text-[10px] font-black font-mono text-muted-foreground/40 hidden sm:block">
                  T-{task.taskId}
                </span>
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="sm:hidden text-[10px] font-black font-mono text-muted-foreground/30">
                      T-{task.taskId}
                    </span>
                    <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                      {task.description}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                      <Briefcase className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{task.groupName || 'No Board'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500/80 uppercase">
                      <Check className="w-3 h-3" />
                      <span>
                        Hạn:{' '}
                        {task.estimateTime
                          ? new Date(task.estimateTime).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${getStatusClassName(mappedStatus)}`}
                  >
                    {STATUS_LABEL[mappedStatus]}
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                    {getTaskPriorityLabel(task.priority)}
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="shrink-0 flex items-center gap-2 mt-2 sm:mt-0 sm:pl-4 sm:border-l border-border/10">
                {showActions ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="h-9 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                      onClick={(e) => handleConfirmTask(task.taskId, e)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-3 w-3 mr-1.5" />
                      Nhận việc
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-4 rounded-full border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest"
                      onClick={(e) => handleRejectTask(task.taskId, e)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1.5" />
                      Từ chối
                    </Button>
                  </div>
                ) : (
                  <button className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300">
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card
      className={`${className} bg-white/40 dark:bg-card/30 backdrop-blur-xl border border-border/10 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[2.5rem] overflow-hidden transition-all duration-500`}
    >
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tighter text-foreground">
                Công việc của tôi
              </h3>
              <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                Theo dõi và quản lý dự án
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as TaskRole)
              handlePageChange(1)
            }}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-slate-100/80 p-1.5 rounded-full h-auto gap-1">
              <TabsTrigger
                value="assignee"
                className="rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                Được giao
              </TabsTrigger>
              <TabsTrigger
                value="supervisor"
                className="rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                Trách nhiệm
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {renderContent()}

        {(totalPages > 1 || currentPage > 1) && !isLoading && tasks.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground opacity-90 uppercase tracking-widest border-b-2 border-primary/40">
                TRANG {currentPage}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                {hasMore ? `MORE TASKS...` : 'END OF LIST'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={hasMore ? currentPage + 1 : currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
