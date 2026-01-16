import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface ChartCardProps {
  title: string
  icon?: React.ReactNode
  badgeText?: string
  children: React.ReactNode
  onClick?: () => void
  contentClassName?: string
  className?: string
}

export default function ChartCard({
  title,
  icon,
  badgeText,
  children,
  onClick,
  contentClassName,
  className,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={onClick ? { y: -4, scale: 1.005 } : undefined}
      className="h-full"
    >
      <Card
        className={`group h-full bg-white/40 dark:bg-card/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 ${className || ''}`}
      >
        <CardContent className={`h-full flex flex-col p-4 sm:p-8 ${contentClassName || ''}`}>
          {/* Enhanced Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {icon && (
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-primary/5">
                  <div className="text-primary">{icon}</div>
                </div>
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tighter text-foreground/90 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <div className="w-6 h-1 bg-primary/20 rounded-full group-hover:w-10 transition-all duration-500" />
              </div>
            </div>

            {badgeText && (
              <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {badgeText}
                </span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div
            role={onClick ? 'button' : undefined}
            className={`flex-1 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
          >
            {children}
          </div>
        </CardContent>

        {/* Subtle Gloss Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Card>
    </motion.div>
  )
}
