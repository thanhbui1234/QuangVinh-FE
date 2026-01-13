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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <Card className="shadow-sm">
        <CardContent className={dense ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">{stat.label}</div>
            <div className="text-muted-foreground">{stat.icon}</div>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div className={dense ? 'text-xl font-semibold' : 'text-2xl font-semibold'}>
              {stat.value}
            </div>
            {stat.delta && (
              <div
                className={`flex items-center gap-1 text-xs ${stat.positive ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                {stat.positive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{stat.delta}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
