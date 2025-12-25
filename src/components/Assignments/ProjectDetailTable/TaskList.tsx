import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL, STATUS_ICON } from './columns'
import { useNavigate } from 'react-router'
import { getTaskPriorityLabel, getTaskTypeLabel } from '@/utils/getLable'
import { User, Clock, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatEstimateHours } from '@/utils/CommonUtils'
type Assignee = { id: string; name: string }
type Supervisor = { id: string; name: string }

export default function TaskList(props: {
  tasks: any
  assignees?: Assignee[]
  supervisors?: Supervisor[]
  onDelete?: (taskId: string) => void
}) {
  const { tasks, assignees, supervisors, onDelete } = props
  const navigate = useNavigate()
  const assigneeIdToName = useMemo(() => {
    if (!assignees) return undefined
    return assignees.reduce<Record<string, string>>((acc, a) => {
      acc[a.id] = a.name
      return acc
    }, {})
  }, [assignees])

  const supervisorIdToName = useMemo(() => {
    if (!supervisors) return undefined
    return supervisors.reduce<Record<string, string>>((acc, s) => {
      acc[s.id] = s.name
      return acc
    }, {})
  }, [supervisors])

  const statusClassMap: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    visible: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
    done: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {tasks.map((t: any) => {
        const numericId = t.id.replace(/\D/g, '')
        return (
          <Card
            key={t.id}
            className="group cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/tasks/${numericId}`)}
          >
            <CardContent className="p-4">
              {/* Header: Title and Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-base line-clamp-2 break-words flex-1">
                  {t.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`${statusClassMap[t.status]} shrink-0 whitespace-nowrap`}
                >
                  <span className="mr-1.5">{STATUS_ICON[t.status]}</span> {STATUS_LABEL[t.status]}
                </Badge>
              </div>

              {/* Description */}
              {/* Description */}
              {t.description ? (
                <p
                  className="text-sm text-muted-foreground line-clamp-2 mb-3"
                  dangerouslySetInnerHTML={{ __html: t.description }}
                />
              ) : null}
              {/* Metadata - Vertical Stack */}
              <div className="space-y-2">
                {/* Assignee */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Người phụ trách:</span>
                  <span className="font-medium truncate">
                    {assigneeIdToName?.[t.assigneeId as string] || 'Chưa gán'}
                  </span>
                </div>

                {/* Supervisor */}
                {(t.supervisor || t.supervisorId) && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Người chịu trách nhiệm:</span>
                    <span className="font-medium truncate">
                      {t.supervisor?.name || supervisorIdToName?.[t.supervisorId as string] || '—'}
                    </span>
                  </div>
                )}

                {/* Estimate Hours */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Ước lượng:</span>
                  <span className="font-medium">
                    {t.status === 'done' || t.status === 9
                      ? t.estimateHours && t.estimateHours > 0
                        ? formatEstimateHours(t.estimateHours)
                        : '0 giờ'
                      : t.estimateHours
                        ? formatEstimateHours(t.estimateHours)
                        : '—'}
                  </span>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Ưu tiên:</span>
                  <span className="font-medium">{getTaskPriorityLabel(t.priority)}</span>
                </div>

                {/* Task Type */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Loại công việc:</span>
                  <span className="font-medium">{getTaskTypeLabel(t.taskType)}</span>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Thao tác:</span>
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(t.id)
                    }}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
