import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { StatusPill } from '@/components/base/StatusPill'
import { Clock, ChevronRight } from 'lucide-react'
import {
  getLeaveIcon,
  type LeavesListDataResponse,
  mapDayOffType,
  MappingLeavesType,
  StatusLeaves,
} from '@/types/Leave.ts'
import { calculateDays, formatDate } from '@/utils/CommonUtils.ts'

type LeaveListItemMobileProps = {
  request: LeavesListDataResponse
  canApprove: boolean
  onViewDetails: (request: LeavesListDataResponse) => void
  onActionClick: (id: number, action: 'approve' | 'reject', request: LeavesListDataResponse) => void
}

export default function LeaveListItemMobile({
  request,
  canApprove,
  onViewDetails,
  onActionClick,
}: LeaveListItemMobileProps) {
  const Icon = getLeaveIcon(request?.absenceType)
  const getTimeLeaves = () => {
    if (!request.offFrom && !request.offTo) return null
    const { days, hours } = calculateDays(request.offFrom, request.offTo)
    return { days, hours }
  }
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
      onClick={() => onViewDetails(request)}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                request.status === StatusLeaves.PENDING
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : request.status === StatusLeaves.APPROVED
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-rose-100 dark:bg-rose-900/30'
              }`}
            >
              <Icon
                className={`size-5 ${
                  request.status === StatusLeaves.PENDING
                    ? 'text-amber-600 dark:text-amber-400'
                    : request.status === StatusLeaves.APPROVED
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-0.5">
                {MappingLeavesType[request?.absenceType] || ''}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(request.offFrom)} - {formatDate(request.offTo)}
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 dark:text-gray-600 flex-shrink-0 ml-2" />
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-gray-400 dark:text-gray-600" />
            <span className="text-sm font-medium text-blue-500   dark:text-blue-300">
              {mapDayOffType?.[request?.dayOffType] || ''}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getTimeLeaves()?.days} ngày {getTimeLeaves()?.hours} giờ
            </span>
          </div>
          <StatusPill status={request.status} size="sm" />
        </div>

        {request.reason && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {request.reason}
          </p>
        )}

        {/* Action Buttons - Only for pending AND allowed roles */}
        {request.status === StatusLeaves.PENDING && canApprove && (
          <>
            <Separator className="my-3 opacity-60" />
            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onActionClick(request.id, 'approve', request)
                }}
                className="flex-1 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200/60 dark:border-emerald-800/40"
                variant="secondary"
              >
                Duyệt
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onActionClick(request.id, 'reject', request)
                }}
                className="flex-1 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors border border-rose-200/60 dark:border-rose-800/40"
                variant="secondary"
              >
                Từ chối
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
