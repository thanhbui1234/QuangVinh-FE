import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { MiniProgressBar } from '@/components/dashboard/Charts'
import type { DailyProgressChartData } from '@/hooks/dashboard/useProjectProgressDay'
import { formatTimestamp } from '@/utils/CommonUtils'
import type { ProgressTask } from '@/types/DashBoard'

interface ProjectProgressDayProps {
  chartData: DailyProgressChartData[]
  dailyProgress: Array<{
    date: string
    dayOfWeek: string
    completedTaskCount: number
    tasks: ProgressTask[]
  }>
  summary: {
    totalCompleted: number
    totalTasks: number
  }
  isLoading?: boolean
  className?: string
  showTaskList?: boolean
  maxTasksToShow?: number
  layout?: 'web' | 'mobile'
}

export function ProjectProgressDay({
  chartData,
  dailyProgress,
  summary,
  isLoading = false,
  className = '',
  showTaskList = true,
  maxTasksToShow = 5,
  layout = 'web',
}: ProjectProgressDayProps) {
  const recentTasks = useMemo(() => {
    const allTasks = dailyProgress.flatMap((day) =>
      day.tasks.map((task) => ({
        ...task,
        date: day.date,
        dayOfWeek: day.dayOfWeek,
      }))
    )
    // Sort by doneTime descending (most recent first)
    return allTasks.sort((a, b) => b.doneTime - a.doneTime).slice(0, maxTasksToShow)
  }, [dailyProgress, maxTasksToShow])

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return { label: 'Cao', variant: 'destructive' as const }
    if (priority >= 2) return { label: 'Trung bình', variant: 'secondary' as const }
    return { label: 'Thấp', variant: 'outline' as const }
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">Không có dữ liệu trong khoảng thời gian này</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <MiniProgressBar data={chartData} />
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> Hoàn thành:{' '}
          <span className="font-medium text-foreground">{summary.totalCompleted}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-slate-400" /> Tổng:{' '}
          <span className="font-medium text-foreground">{summary.totalTasks}</span>
        </div>
      </div>

      {showTaskList && recentTasks.length > 0 && (
        <>
          <Separator className="my-4" />
          {layout === 'web' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Ngày hoàn thành</TableHead>
                  <TableHead>Độ ưu tiên</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority)
                  return (
                    <TableRow key={`${task.taskId}-${task.doneTime}`}>
                      <TableCell className="font-medium">{task.description}</TableCell>
                      <TableCell>{task.assignee.name}</TableCell>
                      <TableCell>{formatTimestamp(task.doneTime)}</TableCell>
                      <TableCell>
                        <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-2 text-xs">
              {recentTasks.map((task) => {
                const priorityBadge = getPriorityBadge(task.priority)
                return (
                  <div key={`${task.taskId}-${task.doneTime}`} className="rounded-md border p-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{task.assignee.name}</span>
                      <Badge variant={priorityBadge.variant} className="text-[10px]">
                        {priorityBadge.label}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm font-medium">{task.description}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {formatTimestamp(task.doneTime)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
