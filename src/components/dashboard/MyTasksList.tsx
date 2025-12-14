import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import { useMyTasksInfinite } from '@/hooks/dashboard/useMyTasks'
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL, STATUS_ICON } from '@/components/Assignments/ProjectDetailTable/columns'

// Map task status to color classes
const getStatusClassName = (status: 'todo' | 'visible' | 'in_progress' | 'done'): string => {
  const statusClassMap: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    visible: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
    done: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
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
  const { tasks, isLoading, handleLoadMore, hasMore, isFetchingMore } = useMyTasksInfinite(
    limit,
    enabled
  )

  const handleTaskClick = () => {
    navigate(`/assignments`)
  }

  if (isLoading && tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="h-4 w-4" /> Công việc của tôi
          </div>
          <Separator className="my-3" />
          <div className="space-y-2">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="h-4 w-4" /> Công việc của tôi
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground text-center py-4">Không có công việc nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <ClipboardList className="h-4 w-4" /> Công việc của tôi
        </div>
        <Separator className="my-3" />
        {/* Mobile list (stacked) */}
        <div className="space-y-2 sm:hidden">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className="rounded-md border p-3 cursor-pointer hover:bg-muted/50"
              onClick={() => handleTaskClick()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">T-{task.taskId}</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const mappedStatus = mapTaskStatus(task.status)
                    return (
                      <Badge
                        variant="outline"
                        className={`${getStatusClassName(mappedStatus)} text-[10px]`}
                      >
                        <span className="mr-1">{STATUS_ICON[mappedStatus]}</span>
                        {STATUS_LABEL[mappedStatus]}
                      </Badge>
                    )
                  })()}
                  {task.estimateTime && (
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(task.estimateTime).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-1 text-sm font-medium">{task.description}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{task.groupName || 'N/A'}</span>
                <span>•</span>
                <Badge variant="outline" className="text-[10px]">
                  {getTaskPriorityLabel(task.priority)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {/* Table for >= sm screens */}
        <div className="-mx-3 hidden overflow-x-auto px-3 sm:block">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => handleTaskClick()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">T-{task.taskId}</span>
                    <span className="text-sm">{task.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const mappedStatus = mapTaskStatus(task.status)
                      return (
                        <Badge variant="outline" className={getStatusClassName(mappedStatus)}>
                          <span className="mr-1.5">{STATUS_ICON[mappedStatus]}</span>
                          {STATUS_LABEL[mappedStatus]}
                        </Badge>
                      )
                    })()}
                    <Badge variant="outline">{getTaskPriorityLabel(task.priority)}</Badge>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{task.groupName || 'N/A'}</span>
                  {task.estimateTime && (
                    <>
                      <span>•</span>
                      <span>{new Date(task.estimateTime).toLocaleDateString('vi-VN')}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {hasMore && (
          <>
            <Separator className="my-3" />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadMore}
              disabled={isFetchingMore || !hasMore}
            >
              {isFetchingMore ? 'Đang tải...' : 'Xem thêm'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
