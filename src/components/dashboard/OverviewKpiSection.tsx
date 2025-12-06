import { useMemo } from 'react'
import { Users, CheckSquare, ClipboardList, Clock } from 'lucide-react'

import StatCard, { type Stat } from '@/components/dashboard/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview'

interface OverviewKpiSectionProps {
  isManagerOrDirector: boolean
  layout?: 'web' | 'mobile'
}

export function OverviewKpiSection({
  isManagerOrDirector,
  layout = 'web',
}: OverviewKpiSectionProps) {
  const { stats, isLoading: isOverviewLoading } = useDashboardOverview(isManagerOrDirector)
  console.log('stats', stats)
  const kpis: Stat[] = useMemo(() => {
    if (!stats) {
      return []
    }

    const baseKpis: Stat[] = [
      {
        label: 'Dự án đang chạy',
        value: String(stats.activeTaskGroupCount ?? 0),
        delta: `${stats.activeTaskGroupCountChange >= 0 ? '+' : ''}${stats.activeTaskGroupCountChange ?? 0}`,
        positive: (stats.activeTaskGroupCountChange ?? 0) >= 0,
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        label: isManagerOrDirector ? 'Công việc đang mở' : 'Công việc của tôi',
        value: String(stats.activeTaskCount ?? 0),
        delta: `${stats.activeTaskCountChange >= 0 ? '+' : ''}${stats.activeTaskCountChange ?? 0}`,
        positive: (stats.activeTaskCountChange ?? 0) >= 0,
        icon: <CheckSquare className="h-5 w-5" />,
      },
      {
        label: 'Hoàn thành',
        value: String(stats.completedTaskCount ?? 0),
        delta: `${stats.completedTaskCountChange >= 0 ? '+' : ''}${stats.completedTaskCountChange ?? 0}`,
        positive: (stats.completedTaskCountChange ?? 0) >= 0,
        icon: <Clock className="h-5 w-5" />,
      },
      {
        label: 'Nhân sự hoạt động',
        value: String(stats.userCount ?? 0),
        delta: `${stats.userCountChange >= 0 ? '+' : ''}${stats.userCountChange ?? 0}`,
        positive: (stats.userCountChange ?? 0) >= 0,
        icon: <Users className="h-5 w-5" />,
      },
    ]

    return baseKpis
  }, [stats, isManagerOrDirector])

  const isMobile = layout === 'mobile'

  if (isOverviewLoading && !kpis.length) {
    return (
      <div
        className={
          isMobile
            ? 'grid w-full gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]'
            : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'
        }
      >
        <Skeleton className={isMobile ? 'h-20 w-full' : 'h-24 w-full'} />
        <Skeleton className={isMobile ? 'h-20 w-full' : 'h-24 w-full'} />
        {!isMobile && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
      </div>
    )
  }

  if (!kpis.length) {
    return null
  }

  console.log('kpis', kpis)

  return (
    <div
      className={
        isMobile
          ? 'grid w-full gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]'
          : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'
      }
    >
      {kpis.map((s) => (
        <StatCard key={s.label} stat={s} dense={isMobile} />
      ))}
    </div>
  )
}
