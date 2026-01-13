import { Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type StatisticsCardsProps = {
  requests?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

const statCards = [
  {
    label: 'Tổng đơn',
    key: 'total' as const,
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Chờ duyệt',
    key: 'pending' as const,
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Đã duyệt',
    key: 'approved' as const,
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    label: 'Từ chối',
    key: 'rejected' as const,
    icon: XCircle,
    gradient: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400',
  },
]

export default function StatisticsCards({ requests }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon
        const value = requests?.[card.key] ?? 0

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={cn(
              'relative overflow-hidden rounded-2xl border-2 border-border p-5',
              'bg-card shadow-sm',
              'hover:shadow-xl transition-all duration-300',
              'group cursor-default'
            )}
          >
            {/* Gradient background on hover */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                card.gradient
              )}
            />

            {/* Content */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                <motion.p
                  className="text-3xl font-bold"
                  key={value}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {value}
                </motion.p>
              </div>

              {/* Icon */}
              <div className={cn('p-3 rounded-xl', card.bgColor)}>
                <Icon className={cn('size-6', card.textColor)} />
              </div>
            </div>

            {/* Bottom accent line */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r',
                card.gradient,
                'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              )}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
