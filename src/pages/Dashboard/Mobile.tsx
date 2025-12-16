import { Badge } from '@/components/ui/badge'
import MobileBottomNav from '@/components/ui/mobile-bottom-nav'
import { PieChart, LineChart, Calendar } from 'lucide-react'
import useCheckRole from '@/hooks/useCheckRole'
import { useNavigate } from 'react-router'
import { MiniLeaveStacked } from '@/components/dashboard/Charts'
import ChartCard from '@/components/dashboard/ChartCard'
import { ProjectStatusRatio } from '@/components/dashboard/ProjectStatusRatio'
import { useTeamLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats'
import { useProjectRatio } from '@/hooks/dashboard/useProjectRatio'
import { useProjectProgressDay } from '@/hooks/dashboard/useProjectProgressDay'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateRangeShort, getDayOfWeekShortLabel } from '@/utils/CommonUtils'
import { OverviewKpiSection } from '@/components/dashboard/OverviewKpiSection'
import { ProjectProgressDay } from '@/components/dashboard/ProjectProgressDay'
import { MyTasksList } from '@/components/dashboard/MyTasksList'

export default function DashboardMobile() {
  const { isManagerPermission, isDirectorPermission } = useCheckRole()
  const isManagerOrDirector = isManagerPermission || isDirectorPermission
  const navigate = useNavigate()
  const {
    chartData: leaveChartData,
    summary: leaveSummary,
    pendingRequests: leavePendingRequests,
    rangeLabel: leaveRangeLabel,
    isLoading: isLeaveStatsLoading,
  } = useTeamLeaveStats(0, isManagerOrDirector)
  const { ratio: projectRatio, isLoading: isProjectRatioLoading } = useProjectRatio(
    false,
    isManagerOrDirector
  )
  const {
    chartData: progressChartData,
    dailyProgress,
    summary: progressSummary,
    rangeLabel: progressRangeLabel,
    isLoading: isProgressLoading,
  } = useProjectProgressDay(0, isManagerOrDirector)
  const leavePendingPreview = leavePendingRequests.slice(0, 3)

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex-1 space-y-4 overflow-auto p-3 pb-24">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Xin chào, chúc bạn một ngày hiệu quả!</p>
          {isDirectorPermission ? (
            <Badge variant="secondary">Director</Badge>
          ) : isManagerPermission ? (
            <Badge variant="secondary">Manager</Badge>
          ) : (
            <Badge>Staff</Badge>
          )}
        </div>

        <ChartCard
          title="Tiến độ hoàn thành"
          icon={<LineChart className="h-4 w-4" />}
          badgeText={progressRangeLabel}
          contentClassName="p-3"
          onClick={() => navigate('/mobile/assignments')}
        >
          <ProjectProgressDay
            chartData={progressChartData}
            dailyProgress={dailyProgress}
            summary={progressSummary}
            isLoading={isProgressLoading}
            showTaskList={true}
            maxTasksToShow={3}
            layout="mobile"
          />
        </ChartCard>

        <OverviewKpiSection isManagerOrDirector={isManagerOrDirector as boolean} layout="mobile" />

        {isManagerOrDirector && (
          <>
            <ChartCard
              title="Trạng thái dự án"
              icon={<PieChart className="h-4 w-4" />}
              contentClassName="p-3"
              onClick={() => navigate('/mobile/assignments')}
            >
              <ProjectStatusRatio
                ratio={projectRatio}
                isLoading={isProjectRatioLoading}
                className="mt-2"
                legendClassName="text-xs"
              />
            </ChartCard>
            <ChartCard
              title="Lịch nghỉ (tuần)"
              icon={<Calendar className="h-4 w-4" />}
              badgeText={leaveRangeLabel}
              contentClassName="p-3"
              onClick={() => navigate('/mobile/leaves')}
            >
              {isLeaveStatsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : leaveChartData.length ? (
                <>
                  <MiniLeaveStacked className="h-20 w-full sm:h-24" data={leaveChartData} />
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                      Đã duyệt:{' '}
                      <span className="text-foreground font-medium">{leaveSummary.approved}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
                      Chờ duyệt:{' '}
                      <span className="text-foreground font-medium">{leaveSummary.pending}</span>
                    </span>
                  </div>
                  {leavePendingPreview.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs">
                      {leavePendingPreview.map((request) => (
                        <div
                          key={`${request.id}-${request.offFrom}`}
                          className="rounded-md border p-2"
                        >
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{request.creator.name}</span>
                            <span>{getDayOfWeekShortLabel(request.dayOfWeek)}</span>
                          </div>
                          <div className="text-sm font-medium">
                            {formatDateRangeShort(request.offFrom, request.offTo)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Không có dữ liệu tuần này</p>
              )}
            </ChartCard>
          </>
        )}

        <MyTasksList limit={5} enabled={true} />
      </div>

      <MobileBottomNav />
    </div>
  )
}
