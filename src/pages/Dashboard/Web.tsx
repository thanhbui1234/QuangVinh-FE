import { useMemo } from 'react'
import { useNavigate } from 'react-router'
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
import { MiniLeaveStacked } from '@/components/dashboard/Charts'
import ChartCard from '@/components/dashboard/ChartCard'
import { ProjectStatusRatio } from '@/components/dashboard/ProjectStatusRatio'
import { PieChart, LineChart, Calendar } from 'lucide-react'
import useCheckRole from '@/hooks/useCheckRole'
import { useTeamLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats'
import { useProjectRatio } from '@/hooks/dashboard/useProjectRatio'
import { useProjectProgressDay } from '@/hooks/dashboard/useProjectProgressDay'
import { formatDateRangeShort, getDayOfWeekShortLabel } from '@/utils/CommonUtils'
import { OverviewKpiSection } from '@/components/dashboard/OverviewKpiSection'
import { ProjectProgressDay } from '@/components/dashboard/ProjectProgressDay'
import { OverdueTasksTable } from '@/components/dashboard/OverdueTasksTable'
import { MyTasksTable } from '@/components/dashboard/MyTasksTable'
import { RecurringTasksTable } from '@/components/dashboard/RecurringTasksTable'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export default function DashboardWeb() {
  const { isManagerPermission, isDirectorPermission } = useCheckRole()
  const navigate = useNavigate()
  const isManagerOrDirector = isManagerPermission || isDirectorPermission
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

  const leavePendingPreview = useMemo(
    () => leavePendingRequests.slice(0, 4),
    [leavePendingRequests]
  )

  const projectCountBadge = useMemo(() => {
    if (!projectRatio) return ' dự án'
    return `${projectRatio.totalTasks} công việc`
  }, [projectRatio])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageBreadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Bảng điều khiển</h2>
          <p className="text-sm text-muted-foreground">Tổng quan tình hình và công việc</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirectorPermission && <Badge variant="secondary">Director</Badge>}
          {!isDirectorPermission && isManagerPermission && (
            <Badge variant="secondary">Manager</Badge>
          )}
          {!isManagerPermission && !isDirectorPermission && <Badge>Staff</Badge>}
        </div>
      </div>

      {isManagerOrDirector && (
        <OverviewKpiSection isManagerOrDirector={isManagerOrDirector} layout="web" />
      )}

      {isManagerOrDirector ? (
        <div className="space-y-6">
          {/* First row: Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="Tiến độ hoàn thành công việc"
                icon={<LineChart className="h-4 w-4" />}
                badgeText={progressRangeLabel}
                onClick={() => navigate('/assignments')}
              >
                <ProjectProgressDay
                  chartData={progressChartData}
                  dailyProgress={dailyProgress}
                  summary={progressSummary}
                  isLoading={isProgressLoading}
                  showTaskList={true}
                  maxTasksToShow={5}
                  layout="web"
                />
              </ChartCard>
            </div>

            <ChartCard
              title="Tỉ lệ trạng thái dự án"
              icon={<PieChart className="h-4 w-4" />}
              badgeText={projectCountBadge}
              onClick={() => navigate('/assignments')}
            >
              <ProjectStatusRatio
                ratio={projectRatio}
                isLoading={isProjectRatioLoading}
                className="mt-2"
              />
            </ChartCard>
          </div>

          {/* Second row: Leave chart */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-4">
              <ChartCard
                title="Lịch nghỉ nhân sự (tuần)"
                icon={<Calendar className="h-4 w-4" />}
                badgeText={leaveRangeLabel}
                onClick={() => navigate('/personnel/leaves')}
              >
                {isLeaveStatsLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : leaveChartData.length ? (
                  <>
                    <MiniLeaveStacked data={leaveChartData} />
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> Đã
                        duyệt:{' '}
                        <span className="font-medium text-foreground">{leaveSummary.approved}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" /> Chờ duyệt:{' '}
                        <span className="font-medium text-foreground">{leaveSummary.pending}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-sm bg-slate-400" /> Tổng:{' '}
                        <span className="font-medium text-foreground">{leaveSummary.total}</span>
                      </div>
                    </div>
                    {leavePendingPreview.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã</TableHead>
                              <TableHead>Người tạo</TableHead>
                              <TableHead>Ngày</TableHead>
                              <TableHead>Khoảng thời gian</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leavePendingPreview.map((request) => (
                              <TableRow key={`${request.id}-${request.offFrom}`}>
                                <TableCell className="font-medium">{request.id}</TableCell>
                                <TableCell>{request.creator.name}</TableCell>
                                <TableCell>{getDayOfWeekShortLabel(request.dayOfWeek)}</TableCell>
                                <TableCell>
                                  {formatDateRangeShort(request.offFrom, request.offTo)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có dữ liệu tuần này</p>
                )}
              </ChartCard>
            </div>
          </div>

          {/* Third row: Task tables - aligned side by side */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OverdueTasksTable limit={5} enabled={isManagerOrDirector} />
            <MyTasksTable limit={5} enabled={true} />
          </div>

          {/* Fourth row: Recurring tasks table */}
          <div className="grid grid-cols-1 gap-4">
            <RecurringTasksTable limit={5} enabled={isManagerOrDirector} />
          </div>
        </div>
      ) : (
        <MyTasksTable limit={5} enabled={true} />
      )}
    </div>
  )
}
