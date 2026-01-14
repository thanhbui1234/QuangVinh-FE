import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useOverdueTasks } from '@/hooks/dashboard/useOverdueTasks'
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL } from '@/components/Assignments/ProjectDetailTable/columns'

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

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-3xl bg-white/40 dark:bg-card/40 border border-white/20 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-muted/20 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted/20 rounded-md" />
                <div className="h-3 w-1/2 bg-muted/10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50/50 flex items-center justify-center border border-emerald-100/50">
            <Clock className="w-8 h-8 text-emerald-500/60" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Bạn đã hoàn thành hết!</p>
            <p className="text-xs text-muted-foreground font-medium">
              Không có công việc nào bị quá hạn.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {tasks.map((task) => {
          const mappedStatus = mapTaskStatus(task.status)
          return (
            <div
              key={task.taskId}
              onClick={() => handleTaskClick(task.taskId)}
              className="group relative p-5 rounded-[2rem] bg-white/40 dark:bg-card/30 border border-border/10 hover:border-red-200/50 hover:bg-white dark:hover:bg-card hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-20 transition-opacity">
                <Clock className="w-12 h-12 text-red-500 -rotate-12" />
              </div>

              <div className="flex gap-4 relative">
                {/* Supervisor Avatar with Status indicator */}
                <div className="relative shrink-0 pt-1">
                  <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-2 ring-red-500/10">
                    <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-400 text-white text-[10px] font-black uppercase">
                      {task?.supervisor?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-border/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-mono text-muted-foreground/40 tracking-wider">
                        T-{task.taskId}
                      </span>
                      <h4 className="text-sm font-black text-foreground/90 truncate group-hover:text-red-600 transition-colors tracking-tight">
                        {task.description}
                      </h4>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground opacity-70 uppercase tracking-widest flex items-center gap-2 leading-none">
                      {task?.supervisor?.name || 'Chưa gán'}
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                      Chịu trách nhiệm
                    </p>
                  </div>

                  {/* Badges Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${getStatusClassName(mappedStatus)}`}
                    >
                      {STATUS_LABEL[mappedStatus]}
                    </div>
                    <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 border border-red-500/20">
                      {getTaskPriorityLabel(task.priority)}
                    </div>
                  </div>
                </div>
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
      <CardContent className="p-8 flex flex-col h-full space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">Việc quá hạn</h3>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                Ưu tiên xử lý ngay
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/10">
            <span className="text-[10px] font-black text-red-600">
              {totalOverdueTasks} CÔNG VIỆC
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-1">{renderContent()}</div>

        {totalPages > 1 && (
          <div className="pt-8 flex flex-col items-center gap-6">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            <div className="w-full flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-foreground opacity-90 uppercase tracking-widest border-b-2 border-red-500/40">
                  PAGE {currentPage}
                </span>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  OF {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted/20 px-3 py-1 rounded-full border border-border/10">
                <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                  {tasks.length} / {totalOverdueTasks}
                </span>
              </div>
            </div>
            <div className="pb-2">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
