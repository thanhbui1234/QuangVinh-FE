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
import { getTaskPriorityLabel, mapTaskStatus } from '@/utils/getLable'
import { STATUS_LABEL, STATUS_ICON } from '@/components/Assignments/ProjectDetailTable/columns'
import type { OverdueTask } from '@/types/DashBoard'

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
      <Card className={`${className} flex flex-col h-full`}>
        <CardContent className="p-4 flex flex-col flex-1">
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
      <Card className={`${className} flex flex-col h-full`}>
        <CardContent className="p-4 flex flex-col flex-1">
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
    <Card className={`${className} flex flex-col h-full`}>
      <CardContent className="p-4 flex flex-col flex-1">
        <SectionTitle title="Việc quá hạn" icon={<Clock className="h-4 w-4" />} />
        <Separator className="my-3" />
        <div className="flex-1 overflow-hidden">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
