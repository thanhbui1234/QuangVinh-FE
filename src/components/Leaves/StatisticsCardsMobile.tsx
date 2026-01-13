import { motion } from 'framer-motion'
import { Clock, CheckCircle2 } from 'lucide-react'

type StatisticsCardsMobileProps = {
  pending?: number
  approved?: number
}

export default function StatisticsCardsMobile({
  pending = 0,
  approved = 0,
}: StatisticsCardsMobileProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-2">
      {/* Pending Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-800/50 p-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Clock className="size-5" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chờ duyệt
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-foreground">{pending}</span>
          <span className="text-xs text-muted-foreground mb-1">đơn</span>
        </div>
      </motion.div>

      {/* Approved Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200/50 dark:border-green-800/50 p-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-5" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Đã duyệt
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-foreground">{approved}</span>
          <span className="text-xs text-muted-foreground mb-1">đơn</span>
        </div>
      </motion.div>
    </div>
  )
}
