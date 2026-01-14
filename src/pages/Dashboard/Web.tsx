import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MiniLeaveStacked } from '@/components/dashboard/Charts'
import ChartCard from '@/components/dashboard/ChartCard'
import { ProjectStatusRatio } from '@/components/dashboard/ProjectStatusRatio'
import {
  PieChart,
  LineChart,
  Calendar,
  ArrowUpRight,
  LayoutDashboard,
  Megaphone,
  Zap,
  UserPlus,
  CheckCircle2,
  Bell,
  UserCircle,
} from 'lucide-react'
import useCheckRole from '@/hooks/useCheckRole'
import { useGetBulletin } from '@/hooks/dashboard/useGetBulletin'
import { useTeamLeaveStats } from '@/hooks/dashboard/useTeamLeaveStats'
import { useProjectRatio } from '@/hooks/dashboard/useProjectRatio'
import { useProjectProgressDay } from '@/hooks/dashboard/useProjectProgressDay'
import { formatDateRangeShort, getDayOfWeekShortLabel } from '@/utils/CommonUtils'
import dayjs from 'dayjs'
import { OverviewKpiSection } from '@/components/dashboard/OverviewKpiSection'
import { ProjectProgressDay } from '@/components/dashboard/ProjectProgressDay'
import { OverdueTasksTable } from '@/components/dashboard/OverdueTasksTable'
import { MyTasksTable } from '@/components/dashboard/MyTasksTable'
import { RecurringTasksTable } from '@/components/dashboard/RecurringTasksTable'
import { Skeleton } from '@/components/ui/skeleton'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
}

export default function DashboardWeb() {
  const { isManagerPermission, isDirectorPermission, user } = useCheckRole()
  const navigate = useNavigate()
  const isManagerOrDirector = isManagerPermission || isDirectorPermission

  const { bulletins, isFetching: isBulletinLoading } = useGetBulletin()

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
    if (!projectRatio) return '0 công việc'
    return `${projectRatio.totalTasks} công việc`
  }, [projectRatio])

  return (
    <motion.div
      className="min-h-screen bg-[#fcfcfd] dark:bg-[#0c0c0e] p-6 lg:p-10 space-y-10 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Premium Header */}
      <motion.header variants={itemVariants} className="space-y-6">
        <PageBreadcrumb />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Tổng quan Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground font-medium max-w-2xl">
              Chào mừng quay trở lại{user?.name ? `, ${user.name}` : ''}. Đây là thống kê hiệu suất
              và lịch trình công việc của bạn hôm nay.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 bg-white dark:bg-card border border-border/40 rounded-2xl shadow-sm flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${isManagerOrDirector ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`}
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Quyền truy cập
                </span>
                <span className="text-xs font-bold text-foreground">
                  {isDirectorPermission ? 'Director' : isManagerPermission ? 'Manager' : 'Staff'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* KPI Section - Structured & Professional */}
      {isManagerOrDirector && (
        <motion.section
          variants={itemVariants}
          className="relative p-8 rounded-[3rem] bg-white/30 dark:bg-card/20 border border-white dark:border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-xl font-black tracking-[0.1em] text-foreground uppercase">
                  Chỉ số quan trọng
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-primary/10 font-bold px-4 py-1.5 rounded-full"
              >
                LIVE UPDATE
              </Badge>
            </div>
            <OverviewKpiSection isManagerOrDirector={isManagerOrDirector} layout="web" />
          </div>
        </motion.section>
      )}

      {isManagerOrDirector ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Progress Chart */}
            <motion.div variants={itemVariants}>
              <ChartCard
                title="Tiến độ công việc"
                icon={<LineChart className="h-4 w-4" />}
                badgeText={progressRangeLabel}
                className="hover:shadow-[0_25px_50px_rgba(59,130,246,0.15)] transition-all border-white dark:border-white/10"
                onClick={() => navigate('/assignments')}
              >
                <ProjectProgressDay
                  chartData={progressChartData}
                  dailyProgress={dailyProgress}
                  summary={progressSummary}
                  isLoading={isProgressLoading}
                  showTaskList={true}
                  maxTasksToShow={4}
                  layout="web"
                />
              </ChartCard>
            </motion.div>

            {/* Task Lists - Primary Section */}
            <motion.div variants={itemVariants}>
              <MyTasksTable
                limit={5}
                enabled={true}
                className="border-white dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
              />
            </motion.div>

            {/* Leave Calendar */}
            <motion.div variants={itemVariants}>
              <ChartCard
                title="Lịch nghỉ nhân sự"
                icon={<Calendar className="h-4 w-4" />}
                badgeText={leaveRangeLabel}
                className="hover:shadow-[0_25px_50px_rgba(249,115,22,0.15)] transition-all border-white dark:border-white/10"
                onClick={() => navigate('/personnel/leaves')}
              >
                {isLeaveStatsLoading ? (
                  <Skeleton className="h-64 w-full rounded-3xl" />
                ) : (
                  <div className="space-y-8">
                    <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/5">
                      <MiniLeaveStacked data={leaveChartData} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          label: 'Đã duyệt',
                          count: leaveSummary.approved,
                          color: 'bg-emerald-500',
                        },
                        { label: 'Chờ duyệt', count: leaveSummary.pending, color: 'bg-amber-500' },
                        { label: 'Tổng số', count: leaveSummary.total, color: 'bg-slate-500' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="group/stat relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-card border border-border/10 flex flex-col items-center text-center space-y-1 hover:border-primary/20 transition-all"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mb-1 ${item.color}`} />
                          <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest">
                            {item.label}
                          </span>
                          <span className="text-2xl font-black text-foreground">{item.count}</span>
                          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/stat:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {leavePendingPreview.length > 0 && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-80">
                            Yêu cầu chờ xử lý
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold hover:bg-primary/5 hover:text-primary rounded-full px-3"
                          >
                            TẤT CẢ
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {leavePendingPreview.map((request) => (
                            <div
                              key={`${request.id}-${request.offFrom}`}
                              className="group/req flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/5 hover:bg-white dark:hover:bg-card hover:border-border/10 hover:shadow-sm transition-all"
                            >
                              <Avatar className="w-10 h-10 border-2 border-white dark:border-white/5 shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
                                  {request.creator.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                  {request.creator.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[9px] font-black uppercase">
                                    {getDayOfWeekShortLabel(request.dayOfWeek)}
                                  </span>
                                  {formatDateRangeShort(request.offFrom, request.offTo)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ChartCard>
            </motion.div>

            {/* Bulletin & Quick Actions section to fill empty space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <ChartCard
                  title="Thông báo nội bộ"
                  icon={<Megaphone className="h-4 w-4" />}
                  className="h-full border-white dark:border-white/10"
                >
                  <div className="space-y-4">
                    {isBulletinLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl bg-muted/20 border border-border/5 space-y-2"
                          >
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : bulletins && bulletins.length > 0 ? (
                      bulletins.map((noti: any) => (
                        <div
                          key={noti.id}
                          className="p-4 rounded-2xl bg-muted/30 border border-border/5 space-y-2 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {!noti.seen && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                              )}
                              <h5 className="text-sm font-bold text-foreground truncate max-w-[150px]">
                                {noti.trigger?.name || 'Thông báo'}
                              </h5>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                              {dayjs(noti.createdTime).fromNow()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {noti.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                        <Bell className="w-8 h-8 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                          Không có thông báo mới
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/notifications')}
                      className="w-full h-10 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl"
                    >
                      Xem tất cả tin tức
                    </Button>
                  </div>
                </ChartCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ChartCard
                  title="Thao tác nhanh"
                  icon={<Zap className="h-4 w-4" />}
                  className="h-full border-white dark:border-white/10"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Thêm nhân sự',
                        icon: <UserPlus className="w-5 h-5" />,
                        color: 'bg-blue-500',
                        path: '/personnel/create',
                      },
                      {
                        label: 'Tạo công việc',
                        icon: <CheckCircle2 className="w-5 h-5" />,
                        color: 'bg-emerald-500',
                        path: '/tasks',
                      },
                      {
                        label: 'Duyệt nghỉ phép',
                        icon: <Calendar className="w-5 h-5" />,
                        color: 'bg-amber-500',
                        path: '/personnel/leaves',
                      },
                      {
                        label: 'Xem báo cáo',
                        icon: <LineChart className="w-5 h-5" />,
                        color: 'bg-indigo-500',
                        path: '/reports',
                      },
                      {
                        label: 'Hồ sơ cá nhân',
                        icon: <UserCircle className="w-5 h-5" />,
                        color: 'bg-rose-500',
                        path: '/profile',
                      },
                      {
                        label: 'Duyệt yêu cầu',
                        icon: <Zap className="w-5 h-5" />,
                        color: 'bg-orange-500',
                        path: '/personnel/list',
                      },
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-card border border-border/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl ${action.color}/10 flex items-center justify-center text-${action.color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}
                        >
                          {action.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground text-center line-clamp-1">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </ChartCard>
              </motion.div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            {/* Status Ratio */}
            <motion.div variants={itemVariants}>
              <ChartCard
                title="Phân bổ dự án"
                icon={<PieChart className="h-4 w-4" />}
                badgeText={projectCountBadge}
                className="hover:shadow-[0_25px_50px_rgba(99,102,241,0.15)] transition-all border-white dark:border-white/10"
                onClick={() => navigate('/assignments')}
              >
                <ProjectStatusRatio
                  ratio={projectRatio}
                  isLoading={isProjectRatioLoading}
                  className="mt-4"
                />
              </ChartCard>
            </motion.div>

            {/* Overdue Section */}
            <motion.div variants={itemVariants}>
              <OverdueTasksTable
                limit={5}
                enabled={isManagerOrDirector}
                className="border-white dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
              />
            </motion.div>

            {/* Recurring Section */}
            <motion.div variants={itemVariants}>
              <RecurringTasksTable
                limit={5}
                enabled={isManagerOrDirector}
                className="border-white dark:border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
              />
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
          <MyTasksTable
            limit={10}
            enabled={true}
            className="border-white dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      )}
    </motion.div>
  )
}
