import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Repeat } from 'lucide-react'
import { PaginationControl } from '@/components/common/PaginationControl'
import { useRecurringTasks } from '@/hooks/dashboard/useRecurringTasks'
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

interface RecurringTasksTableProps {
  limit?: number
  className?: string
  enabled?: boolean
}

export function RecurringTasksTable({
  limit = 5,
  className = '',
  enabled = true,
}: RecurringTasksTableProps) {
  const navigate = useNavigate()
  const { tasks, currentPage, totalPages, isLoading, handlePageChange, hasMore } =
    useRecurringTasks(1, limit, enabled)

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
              className="h-24 w-full rounded-[2rem] bg-white/40 dark:bg-card/40 border border-white/20 animate-pulse"
            />
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <Repeat className="w-10 h-10 text-muted-foreground" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Không có công việc lặp
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 mt-8">
        {tasks.map((task) => {
          const mappedStatus = mapTaskStatus(task.status)
          const nextExecutionDate = task.nextExecutionTime
            ? new Date(task.nextExecutionTime).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A'

          return (
            <div
              key={task.taskId}
              onClick={() => handleTaskClick(task.taskId)}
              className="group relative p-5 rounded-[2.5rem] bg-white/40 dark:bg-card/30 border border-border/5 hover:border-indigo-200/50 hover:bg-white dark:hover:bg-card hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden"
            >
              <div className="flex gap-5">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                    <Repeat className="w-6 h-6 text-indigo-500/60" />
                  </div>
                  <span className="text-[10px] font-black font-mono text-muted-foreground/40 uppercase tracking-tighter">
                    T-{task.taskId}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-foreground group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                      {task.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                        <span className="truncate max-w-[150px]">
                          {task.groupName || 'Hệ thống'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                        <span>Kế hoạch: {nextExecutionDate}</span>
                      </div>
                    </div>
                  </div>

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
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Repeat className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tighter text-foreground">
                Công việc định kỳ
              </h3>
              <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                Tự động lặp lại theo chu kỳ
              </p>
            </div>
          </div>
        </div>

        {renderContent()}

        {(totalPages > 1 || currentPage > 1) && !isLoading && tasks.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-foreground opacity-90 uppercase tracking-widest border-b-2 border-indigo-500/40">
                TRANG {currentPage}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                {hasMore ? `MORE TASKS...` : 'END OF LIST'}
              </span>
            </div>
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
