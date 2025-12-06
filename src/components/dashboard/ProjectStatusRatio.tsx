import { MiniDonut } from './Charts'
import type { ProjectRatio } from '@/types/DashBoard'

interface ProjectStatusRatioProps {
  ratio?: ProjectRatio
  isLoading?: boolean
  className?: string
  showLegend?: boolean
  legendClassName?: string
}

export function ProjectStatusRatio({
  ratio,
  isLoading = false,
  className = '',
  showLegend = true,
  legendClassName = '',
}: ProjectStatusRatioProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
        {showLegend && (
          <div className={`space-y-2 text-sm ${legendClassName}`}>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        )}
      </div>
    )
  }

  if (!ratio) {
    return <div className={`flex items-center gap-4 ${className}`}>Không tải được dữ liệu</div>
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <MiniDonut
        onTimePercentage={ratio.onTimePercentage}
        delayedPercentage={ratio.delayedPercentage}
      />
      {showLegend && (
        <div className={`space-y-2 text-sm ${legendClassName}`}>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Đúng tiến độ:{' '}
            {ratio.onTimePercentage}%
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Chậm:{' '}
            {ratio.delayedPercentage}%
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> Tạm dừng:{' '}
            {ratio.delayedTasks}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> Số task đúng tiến độ:{' '}
            {ratio.onTimeTasks}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> Số task chậm tiến độ:{' '}
            {ratio.delayedTasks}
          </div>
        </div>
      )}
    </div>
  )
}
