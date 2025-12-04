import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL, STATUS_ICON } from './columns'
import { useNavigate } from 'react-router'
import { getTaskPriorityLabel, getTaskTypeLabel } from '@/utils/getLable'

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
    <div className="flex flex-col gap-3">
      {tasks.map((t: any) => {
        const numericId = t.id.replace(/\D/g, '')
        return (
          <Card key={t.id} className="p-3" onClick={() => navigate(`/tasks/${numericId}`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                {t.description ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">{t.description}</div>
                ) : null}
              </div>
              <Badge variant={statusVariantMap[t.status]}>
                {STATUS_ICON[t.status]} {STATUS_LABEL[t.status]}
              </Badge>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="mr-1">Người phụ trách:</span>
                <span className="font-medium text-foreground">
                  {assigneeIdToName?.[t.assigneeId as string] || 'Chưa gán người phụ trách'}
                </span>
              </div>
              <div className="text-right">
                <span className="mr-1">Ước lượng:</span>
                <span className="font-medium text-foreground">{t.estimateHours ?? ''} h</span>
              </div>
              <div>
                <span className="mr-1">Ưu tiên:</span>
                <span className="font-medium text-foreground">
                  {getTaskPriorityLabel(t.priority)}
                </span>
              </div>
              <div className="text-right">
                <span className="mr-1">Loại:</span>
                <span className="font-medium text-foreground">{getTaskTypeLabel(t.taskType)}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
