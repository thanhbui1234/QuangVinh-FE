import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export type Stat = {
  label: string
  value: string
  delta?: string
  positive?: boolean
  icon?: React.ReactNode
}

export default function StatCard({ stat, dense = false }: { stat: Stat; dense?: boolean }) {
  return (
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
  )
}
