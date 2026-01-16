import MobileBottomNav from '@/components/ui/mobile-bottom-nav'
import { PieChart, LineChart, Calendar, User, Sparkles } from 'lucide-react'
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
import { motion, type Variants } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
    },
  },
}

export default function DashboardMobile() {
  const { isManagerPermission, isDirectorPermission, user } = useCheckRole()
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
    <div className="flex h-dvh flex-col bg-[#fcfcfd] dark:bg-[#0c0c0e]">
      {/* Mobile Header - Premium */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-10 pb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-white dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-border/5">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5 translate-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                DAILY OVERVIEW
              </p>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 opacity-60" />
            </div>
            <h2 className="text-lg font-black text-foreground line-clamp-1 tracking-tight">
              Hi, {user?.name?.split(' ').pop() || 'Bạn'} 👋
            </h2>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="flex-1 space-y-10 overflow-auto pb-40 scrollbar-hide"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Progress Card - Primary Focus */}
        <motion.div variants={itemVariants}>
          <ChartCard
            title="Tiến độ công việc"
            icon={<LineChart className="h-4 w-4" />}
            badgeText={progressRangeLabel}
            className="rounded-[3rem] border-white dark:border-white/10 shadow-2xl shadow-primary/5 h-auto bg-white/50 backdrop-blur-xl"
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
        </motion.div>

        {/* Stats Section - Clearer grouping */}
        <motion.section
          variants={itemVariants}
          className="relative p-3 rounded-[2rem] bg-slate-50 dark:bg-card/20 border border-border/10 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
              Thống kê quan trọng
            </h3>
          </div>
          <OverviewKpiSection
            isManagerOrDirector={isManagerOrDirector as boolean}
            layout="mobile"
          />
        </motion.section>

        {isManagerOrDirector && (
          <div className="space-y-10">
            <motion.div variants={itemVariants}>
              <ChartCard
                title="Phân bổ dự án"
                icon={<PieChart className="h-4 w-4" />}
                className="rounded-[3rem] border-white dark:border-white/10 shadow-xl shadow-indigo-500/5 bg-white/50 backdrop-blur-xl"
                onClick={() => navigate('/mobile/assignments')}
              >
                <ProjectStatusRatio
                  ratio={projectRatio}
                  isLoading={isProjectRatioLoading}
                  className="mt-2"
                  legendClassName="text-[11px]"
                />
              </ChartCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ChartCard
                title="Lịch nghỉ tuần"
                icon={<Calendar className="h-4 w-4" />}
                badgeText={leaveRangeLabel}
                className="rounded-[3rem] border-white dark:border-white/10 shadow-xl shadow-orange-500/5 bg-white/50 backdrop-blur-xl"
                onClick={() => navigate('/mobile/leaves')}
              >
                {isLeaveStatsLoading ? (
                  <Skeleton className="h-40 w-full rounded-[2rem]" />
                ) : leaveChartData.length ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 rounded-[2rem] border border-border/5">
                      <MiniLeaveStacked className="h-28 w-full" data={leaveChartData} />
                    </div>

                    <div className="flex gap-6 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                          {leaveSummary.approved} Đã duyệt
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                          {leaveSummary.pending} Chờ duyệt
                        </span>
                      </div>
                    </div>

                    {leavePendingPreview.length > 0 && (
                      <div className="grid grid-cols-1 gap-3">
                        {leavePendingPreview.map((request) => (
                          <div
                            key={`${request.id}-${request.offFrom}`}
                            className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 border border-border/5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/10">
                              {request.creator.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {request.creator.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-medium truncate">
                                <span className="text-amber-600/80 mr-1.5">
                                  {getDayOfWeekShortLabel(request.dayOfWeek)}
                                </span>
                                {formatDateRangeShort(request.offFrom, request.offTo)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2 opacity-40">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
                      Không có dữ liệu nghỉ
                    </p>
                  </div>
                )}
              </ChartCard>
            </motion.div>
          </div>
        )}

        <motion.div variants={itemVariants} className="pt-2">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                Công việc của tôi
              </h3>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              TẤT CẢ
            </button>
          </div>
          <MyTasksList
            limit={5}
            enabled={true}
            className="rounded-[3rem] border-white dark:border-white/10 shadow-2xl shadow-slate-200/40 dark:shadow-none bg-white/50 backdrop-blur-xl"
          />
        </motion.div>
      </motion.div>

      <MobileBottomNav />
    </div>
  )
}
