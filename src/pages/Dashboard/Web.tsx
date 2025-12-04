import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SectionTitle from '@/components/dashboard/SectionTitle'
import { MiniBar, MiniDonut, MiniLeaveStacked, MiniLine } from '@/components/dashboard/Charts'
import ChartCard from '@/components/dashboard/ChartCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ClipboardList, Clock, BarChart3, PieChart, LineChart, Calendar } from 'lucide-react'
import useCheckRole from '@/hooks/useCheckRole'
import { useTeamLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats'
import { formatDateRangeShort, getDayOfWeekShortLabel } from '@/utils/CommonUtils'
import { OverviewKpiSection } from '@/components/dashboard/OverviewKpiSection'
import { Skeleton } from '@/components/ui/skeleton'

// Stat type moved to shared component

const dummyMyTasks = [
  {
    id: 'T-1021',
    name: 'Sửa lỗi màn hình đăng nhập',
    project: 'PWA Core',
    due: 'Hôm nay',
    status: 'Đang làm',
    priority: 'Cao',
  },
  {
    id: 'T-1022',
    name: 'Thiết kế component Card',
    project: 'UI Kit',
    due: 'Ngày mai',
    status: 'Chờ review',
    priority: 'Trung bình',
  },
  {
    id: 'T-1023',
    name: 'Viết test cho API',
    project: 'Backend',
    due: 'Trong 3 ngày',
    status: 'Mới',
    priority: 'Thấp',
  },
]

const dummyOverdue = [
  { id: 'T-990', name: 'Tối ưu hiệu năng bảng', owner: 'Quang', days: 2 },
  { id: 'T-981', name: 'Cập nhật tài liệu quy trình', owner: 'Linh', days: 1 },
]

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
  } = useTeamLeaveStats()

  const leavePendingPreview = useMemo(
    () => leavePendingRequests.slice(0, 4),
    [leavePendingRequests]
  )

  return (
    <div className="p-6 space-y-6">
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
          {!isManagerPermission && !isDirectorPermission && <Badge>Worker</Badge>}
        </div>
      </div>

      <OverviewKpiSection isManagerOrDirector={isManagerOrDirector} layout="web" />

      {isManagerOrDirector ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              title="Tiến độ công việc theo tuần"
              icon={<LineChart className="h-4 w-4" />}
              badgeText="Tuần 45"
              onClick={() => navigate('/assignments')}
            >
              <MiniLine />
            </ChartCard>
          </div>

          <ChartCard
            title="Tỉ lệ trạng thái dự án"
            icon={<PieChart className="h-4 w-4" />}
            badgeText="12 dự án"
            onClick={() => navigate('/assignments')}
          >
            <div className="flex items-center gap-4">
              <MiniDonut />
              <div className="space-y-2 text-sm">
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

          <div className="lg:col-span-2">
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
                      <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> Đã duyệt:{' '}
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

          <div className="lg:col-span-2">
            <ChartCard
              title="Năng suất đội nhóm"
              icon={<BarChart3 className="h-4 w-4" />}
              badgeText="Tháng này"
              onClick={() => navigate('/assignments')}
            >
              <MiniBar />
            </ChartCard>
          </div>

          <Card>
            <CardContent className="p-4">
              <SectionTitle title="Việc quá hạn" icon={<Clock className="h-4 w-4" />} />
              <Separator className="my-3" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Phụ trách</TableHead>
                    <TableHead className="text-right">Số ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyOverdue.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.id}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.owner}</TableCell>
                      <TableCell className="text-right">{t.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              title="Tiến độ tuần của tôi"
              icon={<LineChart className="h-4 w-4" />}
              badgeText="Tuần 45"
              onClick={() => navigate('/assignments')}
            >
              <MiniLine />
            </ChartCard>
          </div>
          <ChartCard title="Phân bổ thời gian" icon={<PieChart className="h-4 w-4" />}>
            <div className="mt-2 flex items-center gap-4">
              <MiniDonut />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Thực thi:
                  60%
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600" /> Review: 25%
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> Họp: 15%
                </div>
              </div>
            </div>
          </ChartCard>

          <Card className="lg:col-span-3">
            <CardContent className="p-4">
              <SectionTitle
                title="Công việc của tôi"
                icon={<ClipboardList className="h-4 w-4" />}
              />
              <Separator className="my-3" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Dự án</TableHead>
                    <TableHead>Hạn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Độ ưu tiên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyMyTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.id}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.project}</TableCell>
                      <TableCell>{t.due}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{t.priority}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
