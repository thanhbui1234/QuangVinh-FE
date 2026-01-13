import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type FilterPillsProps<T = unknown> = {
  options: Array<{
    label: string
    value: T
    total?: number
  }>
  value: T
  onChange: (value: T) => void
  className?: string
}

export function AnimatedFilterPills<T = unknown>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  const activeIndex = options.findIndex((opt) => {
    // For array values, do deep comparison
    if (Array.isArray(opt.value) && Array.isArray(value)) {
      return JSON.stringify([...opt.value].sort()) === JSON.stringify([...value].sort())
    }
    return opt.value === value
  })

  return (
    <div className={cn('relative flex gap-2 flex-wrap', className)}>
      {options.map((option, index) => {
        const isActive = index === activeIndex

        return (
          <motion.button
            key={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
              'overflow-hidden',
              isActive
                ? 'text-white shadow-lg shadow-orange-500/30'
                : 'text-foreground/70 bg-muted/50 hover:bg-muted hover:text-foreground'
            )}
            whileHover={!isActive ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.95 }}
            initial={false}
          >
            {/* Active gradient background */}
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {option.label}
              {option.total !== undefined && (
                <motion.span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-background/80 text-foreground/90'
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {option.total}
                </motion.span>
              )}
            </span>

            {/* Shimmer effect on active */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'linear',
                }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
