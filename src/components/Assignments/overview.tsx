import { useMemo } from 'react'
import { STATUS_ICON, STATUS_LABEL } from './ProjectDetailTable/columns'

export const Overview = (props: { tasks: any }) => {
  const { tasks } = props
  const totalHours = useMemo(() => {
    return tasks.reduce((sum: any, t: any) => sum + Math.max(0, t.estimateHours || 0), 0)
  }, [tasks])

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Tổng số task</div>
            <div className="text-lg font-semibold text-foreground">{tasks.length}</div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-3">
            <div className="text-sm text-muted-foreground">Tổng số giờ</div>
            <div className="text-lg font-semibold text-foreground">{totalHours} giờ</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['todo', 'in_progress', 'pending', 'done', 'rejected'] as any[]).map((st) => {
            const count = tasks.filter((t: any) => t.status === st).length
            return (
              <div
                key={st}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm"
              >
                <span className="flex items-center">{STATUS_ICON[st]}</span>
                <span className="text-foreground">{STATUS_LABEL[st]}</span>
                <span className="ml-1 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground border border-border">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
