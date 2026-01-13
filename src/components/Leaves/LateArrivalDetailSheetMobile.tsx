import BottomSheet from '@/components/ui/bottom-sheet.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import {
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Clock4,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { type LeavesListDataResponse, StatusLeaves } from '@/types/Leave.ts'
import { formatDate } from '@/utils/CommonUtils.ts'

type LateArrivalDetailSheetMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRequest: LeavesListDataResponse | null
  isLoading?: boolean
  onEdit?: (request: LeavesListDataResponse) => void
  onDelete?: (request: LeavesListDataResponse) => void
  canEditOrDelete?: (request: LeavesListDataResponse) => boolean
  canApprove?: boolean
  onActionClick?: (
    id: number,
    action: 'approve' | 'reject',
    request?: LeavesListDataResponse
  ) => void
}

export default function LateArrivalDetailSheetMobile({
  open,
  onOpenChange,
  selectedRequest,
  isLoading = false,
  onEdit,
  onDelete,
  canEditOrDelete,
  canApprove,
  onActionClick,
}: LateArrivalDetailSheetMobileProps) {
  // Extract time from ISO string
  const getArrivalTime = () => {
    if (!selectedRequest?.offFrom) return null
    const date = new Date(selectedRequest.offFrom)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const arrivalTime = getArrivalTime()

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết đơn đi muộn"
      description="Thông tin chi tiết về đơn đi muộn"
      maxHeightClassName="max-h-[90vh]"
      padded={false}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12 px-4">
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : selectedRequest ? (
        <div className="px-4 pb-6 space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center pt-2">
            {selectedRequest.status === StatusLeaves.PENDING && (
              <Badge variant="secondary" className="gap-2 px-4 py-2">
                <AlertCircle className="size-4" />
                Chờ duyệt
              </Badge>
            )}
            {selectedRequest.status === StatusLeaves.APPROVED && (
              <Badge className="gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                <CheckCircle2 className="size-4" />
                Đã duyệt
              </Badge>
            )}
            {selectedRequest.status === StatusLeaves.REJECTED && (
              <Badge className="gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0">
                <XCircle className="size-4" />
                Từ chối
              </Badge>
            )}
          </div>

          {/* Date and Time Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 border border-orange-200/50 dark:border-orange-800/30">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Calendar className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ngày</p>
                  <p className="text-base font-bold text-foreground">
                    {formatDate(selectedRequest.offFrom)}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Card */}
            {arrivalTime && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200/50 dark:border-pink-800/30">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-500/10">
                    <Clock4 className="size-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Giờ</p>
                    <p className="text-base font-bold text-foreground">{arrivalTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User className="size-4" />
                Người tạo đơn
              </span>
              <div className="flex items-center gap-2">
                <Avatar className="size-8 border-2 border-background">
                  <AvatarImage
                    src={selectedRequest.creator?.avatar}
                    alt={selectedRequest.creator?.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-xs">
                    {selectedRequest.creator?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.creator?.name || selectedRequest.creator?.email || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Lý do đi muộn</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedRequest.reason}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(selectedRequest.createdTime)}
              </span>
            </div>
            {selectedRequest.updatedTime && (
              <>
                <Separator className="opacity-60" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Cập nhật lần cuối
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedRequest.updatedTime)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {selectedRequest.status === StatusLeaves.PENDING && (
            <div className="space-y-3 pt-2">
              {/* Approver Actions */}
              {canApprove && onActionClick && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      onActionClick(selectedRequest.id, 'reject', selectedRequest)
                      onOpenChange(false)
                    }}
                    variant="outline"
                    className="h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 font-semibold"
                  >
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      onActionClick(selectedRequest.id, 'approve', selectedRequest)
                      onOpenChange(false)
                    }}
                    className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Duyệt đơn
                  </Button>
                </div>
              )}

              {/* Creator Actions */}
              {canEditOrDelete && canEditOrDelete(selectedRequest) && (
                <div className="grid grid-cols-2 gap-3">
                  {onEdit && (
                    <Button
                      onClick={() => {
                        onEdit(selectedRequest)
                        onOpenChange(false)
                      }}
                      variant="outline"
                      className="h-12 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 gap-2"
                    >
                      <Edit className="size-4" />
                      Sửa đơn
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 gap-2"
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
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 px-4">
          <p className="text-sm text-muted-foreground">Không tìm thấy thông tin đơn đi muộn</p>
        </div>
      )}
    </BottomSheet>
  )
}
