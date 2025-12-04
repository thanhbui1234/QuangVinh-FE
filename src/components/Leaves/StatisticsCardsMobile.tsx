import { Clock, CheckCircle2 } from 'lucide-react'

type StatisticsCardsMobileProps = {
  pending?: number
  approved?: number
}

export default function StatisticsCardsMobile({ pending, approved }: StatisticsCardsMobileProps) {
  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{pending}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Chờ duyệt</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{approved}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Đã duyệt</p>
        </div>
      </div>
    </div>
  )
}
