import { Card } from '@/components/ui/card.tsx'
import { Calendar, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export default function StatisticsCards(props: any) {
  const { requests } = props

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-medium">
              Tổng đơn
            </p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{requests?.total}</p>
          </div>
          <Calendar className="size-9 text-blue-500 opacity-80" />
        </div>
      </Card>

      <Card className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400 font-medium">
              Chờ duyệt
            </p>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
              {requests?.pending}
            </p>
          </div>
          <AlertCircle className="size-9 text-amber-500 opacity-80" />
        </div>
      </Card>

      <Card className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-medium">
              Đã duyệt
            </p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {requests?.approved}
            </p>
          </div>
          <CheckCircle2 className="size-9 text-emerald-500 opacity-80" />
        </div>
      </Card>

      <Card className="p-5 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400 font-medium">
              Từ chối
            </p>
            <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">
              {requests?.rejected}
            </p>
          </div>
          <XCircle className="size-9 text-rose-500 opacity-80" />
        </div>
      </Card>
    </div>
  )
}
