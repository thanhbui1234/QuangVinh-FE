import BottomSheet from '@/components/ui/bottom-sheet.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Clock, Edit, Trash2 } from 'lucide-react'
import {
  getLeaveIcon,
  type LeavesListDataResponse,
  mapDayOffType,
  MappingLeavesType,
  StatusLeaves,
} from '@/types/Leave.ts'
import { calculateDays, formatDate } from '@/utils/CommonUtils.ts'

type ViewDetailsSheetMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRequest: LeavesListDataResponse | null
  onEdit?: (request: LeavesListDataResponse) => void
  onDelete?: (request: LeavesListDataResponse) => void
}

export default function ViewDetailsSheetMobile({
  open,
  onOpenChange,
  selectedRequest,
  onEdit,
  onDelete,
}: ViewDetailsSheetMobileProps) {
  const getTimeLeaves = () => {
    if (!selectedRequest?.offFrom && !selectedRequest?.offTo) return null
    const { days, hours } = calculateDays(selectedRequest.offFrom, selectedRequest.offTo)
    return { days, hours }
  }
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết đơn nghỉ"
      description="Thông tin chi tiết về đơn xin nghỉ"
    >
      {selectedRequest && (
        <div className="space-y-4 pb-6">
          {/* iOS-style Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Loại nghỉ</span>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getLeaveIcon(selectedRequest.absenceType)
                  return <Icon className="size-5 text-blue-600 dark:text-blue-400" />
                })()}
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {MappingLeavesType?.[selectedRequest?.absenceType] || ''}
                </span>
              </div>
            </div>

            <Separator className="opacity-60" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Chế độ nghỉ</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  {mapDayOffType?.[selectedRequest?.dayOffType] || ''}
                </span>
              </div>
            </div>

            <Separator className="opacity-60" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Từ ngày</span>
              <span className="text-base font-medium text-gray-900 dark:text-white">
                {formatDate(selectedRequest?.offFrom) || ''}
              </span>
            </div>
            <Separator className="opacity-60" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Đến ngày</span>
              <span className="text-base font-medium text-gray-900 dark:text-white">
                {formatDate(selectedRequest?.offTo) || ''}
              </span>
            </div>
            <Separator className="opacity-60" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Số ngày nghỉ</span>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-400" />
                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  {getTimeLeaves()?.days} ngày {getTimeLeaves()?.hours} giờ
                </span>
              </div>
            </div>
            <Separator className="opacity-60" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</span>
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  selectedRequest.status === StatusLeaves.PENDING
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : selectedRequest.status === StatusLeaves.APPROVED
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                {selectedRequest.status === StatusLeaves.PENDING
                  ? 'Chờ duyệt'
                  : selectedRequest.status === StatusLeaves.APPROVED
                    ? 'Đã duyệt'
                    : 'Từ chối'}
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
              Lý do nghỉ
            </Label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>
          </div>

          {/* Action Buttons - Only show for pending requests */}
          {selectedRequest.status === StatusLeaves.PENDING && (
            <div className="space-y-3">
              {onEdit && (
                <Button
                  onClick={() => {
                    onEdit(selectedRequest)
                    onOpenChange(false)
                  }}
                  className="w-full h-12 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Edit className="size-4" />
                  Sửa đơn
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 flex items-center justify-center gap-2"
                  onClick={() => {
                    onDelete(selectedRequest)
                  }}
                >
                  <Trash2 className="size-4" />
                  Xoá đơn
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  )
}
