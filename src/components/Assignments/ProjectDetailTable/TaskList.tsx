import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL, STATUS_ICON } from './columns'
import { useNavigate } from 'react-router'
import { getTaskPriorityLabel, getTaskTypeLabel } from '@/utils/getLable'
import { User, Clock, AlertCircle, FileText } from 'lucide-react'

type Assignee = { id: string; name: string }

export default function TaskList(props: { tasks: any; assignees?: Assignee[] }) {
  const { tasks, assignees } = props
  const navigate = useNavigate()
  const assigneeIdToName = useMemo(() => {
    if (!assignees) return undefined
    return assignees.reduce<Record<string, string>>((acc, a) => {
      acc[a.id] = a.name
      return acc
    }, {})
  }, [assignees])

  const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    todo: 'secondary',
    in_progress: 'outline',
    pending: 'outline',
    done: 'default',
    cancel: 'destructive',
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
                <Badge variant={statusVariantMap[t.status]} className="shrink-0 whitespace-nowrap">
                  {STATUS_ICON[t.status]} {STATUS_LABEL[t.status]}
                </Badge>
              </div>

              {/* Description */}
              {t.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
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

                {/* Estimate Hours */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Ước lượng:</span>
                  <span className="font-medium">{t.estimateHours ?? '—'} h</span>
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
                  <span className="text-muted-foreground">Loại:</span>
                  <span className="font-medium">{getTaskTypeLabel(t.taskType)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
