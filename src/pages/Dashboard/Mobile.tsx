import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import MobileBottomNav from '@/components/ui/mobile-bottom-nav'
import { ClipboardList, PieChart, LineChart, Calendar } from 'lucide-react'
import useCheckRole from '@/hooks/useCheckRole'
import { useNavigate } from 'react-router'
// Section title provided by ChartCard; no direct use here
import { MiniDonut, MiniLeaveStacked, MiniLine } from '@/components/dashboard/Charts'
import ChartCard from '@/components/dashboard/ChartCard'
import { useTeamLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateRangeShort, getDayOfWeekShortLabel } from '@/utils/CommonUtils'
import { OverviewKpiSection } from '@/components/dashboard/OverviewKpiSection'

const dummyMyTasks = [
  { id: 'T-1021', name: 'Sửa lỗi màn hình đăng nhập', due: 'Hôm nay', status: 'Đang làm' },
  { id: 'T-1022', name: 'Thiết kế component Card', due: 'Ngày mai', status: 'Chờ review' },
]

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
  } = useTeamLeaveStats()
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
            <Badge>Worker</Badge>
          )}
        </div>

        <ChartCard
          title="Tiến độ tuần"
          icon={<LineChart className="h-4 w-4" />}
          badgeText="Tuần 45"
          contentClassName="p-3"
          onClick={() => navigate('/mobile/assignments')}
        >
          <MiniLine className="h-14 w-full sm:h-16" />
        </ChartCard>

        <OverviewKpiSection isManagerOrDirector={isManagerOrDirector} layout="mobile" />

        {isManagerOrDirector && (
          <>
            <ChartCard
              title="Trạng thái dự án"
              icon={<PieChart className="h-4 w-4" />}
              contentClassName="p-3"
              onClick={() => navigate('/mobile/assignments')}
            >
              <div className="mt-2 flex items-center gap-3">
                <MiniDonut className="h-14 w-14 sm:h-16 sm:w-16" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Đúng tiến
                    độ: 60%
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Chậm: 25%
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> Tạm dừng: 15%
                  </div>
                </div>
              </div>
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

        <Card className="w-full">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="h-4 w-4" /> Công việc của tôi
            </div>
            {/* Mobile list (stacked) */}
            <div className="space-y-2 sm:hidden">
              {dummyMyTasks.map((t) => (
                <div key={t.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t.id}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t.status}</Badge>
                      <span className="text-[11px] text-muted-foreground">{t.due}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm font-medium">{t.name}</div>
                </div>
              ))}
            </div>
            {/* Table for >= sm screens */}
            <div className="-mx-3 hidden overflow-x-auto px-3 sm:block">
              <Table className="min-w-[520px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Hạn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyMyTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.id}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{t.status}</Badge>
                          <span className="text-xs text-muted-foreground">{t.due}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav />
    </div>
  )
}
