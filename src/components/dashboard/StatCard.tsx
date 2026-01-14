import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

export type Stat = {
  label: string
  value: string
  delta?: string
  positive?: boolean
  icon?: React.ReactNode
}

export default function StatCard({ stat, dense = false }: { stat: Stat; dense?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden bg-white/50 dark:bg-card/40 backdrop-blur-md border border-white dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 group hover:border-primary/30">
        <CardContent className={dense ? 'p-4' : 'p-6'}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60 leading-none">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 pt-1">
                <h3 className={dense ? 'text-xl font-black' : 'text-3xl font-black tracking-tight'}>
                  {stat.value}
                </h3>
                {stat.delta && (
                  <div
                    className={`flex items-center gap-0.5 text-[10px] font-black leading-none ${stat.positive ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {stat.positive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    <span>{stat.delta}</span>
                  </div>
                )}
              </div>
            </div>
            {stat.icon && (
              <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {stat.icon}
              </div>
            )}
          </div>

          {/* Subtle accent bar */}
          <div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.positive ? 'from-emerald-500/20 to-emerald-500/5' : 'from-primary/20 to-primary/5'} w-0 group-hover:w-full transition-all duration-500`}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
