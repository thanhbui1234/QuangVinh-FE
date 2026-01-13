import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Clock4,
} from 'lucide-react'
import { type LeavesListDataResponse, StatusLeaves } from '@/types/Leave.ts'
import { formatDate } from '@/utils/CommonUtils.ts'

type LateArrivalDetailDialogProps = {
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

export default function LateArrivalDetailDialog({
  open,
  onOpenChange,
  selectedRequest,
  isLoading = false,
  onEdit,
  onDelete,
  canEditOrDelete,
  canApprove = false,
  onActionClick,
}: LateArrivalDetailDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" animationVariant="fade">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-background border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <DialogHeader className="relative px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20">
                <Clock className="size-6 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <DialogTitle className="text-2xl font-bold mb-1.5">
                  Chi tiết đơn đi muộn
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Thông tin chi tiết về đơn đi muộn
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : selectedRequest ? (
          <div className="px-6 py-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              {selectedRequest.status === StatusLeaves.PENDING && (
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                  <AlertCircle className="size-4" />
                  Chờ duyệt
                </Badge>
              )}
              {selectedRequest.status === StatusLeaves.APPROVED && (
                <Badge className="gap-2 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                  <CheckCircle2 className="size-4" />
                  Đã duyệt
                </Badge>
              )}
              {selectedRequest.status === StatusLeaves.REJECTED && (
                <Badge className="gap-2 px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0">
                  <XCircle className="size-4" />
                  Từ chối
                </Badge>
              )}
            </div>

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 border border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Calendar className="size-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày đi muộn</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatDate(selectedRequest.offFrom)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Card */}
              {arrivalTime && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200/50 dark:border-pink-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <Clock4 className="size-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Giờ đi muộn</p>
                      <p className="text-lg font-bold text-foreground">{arrivalTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info Card */}
            <div className="p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 border-2 border-background">
                  <AvatarImage
                    src={selectedRequest.creator?.avatar}
                    alt={selectedRequest.creator?.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                    {selectedRequest.creator?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Người tạo đơn</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {selectedRequest.creator?.name || selectedRequest.creator?.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Card */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Lý do đi muộn</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-sm text-foreground leading-relaxed">{selectedRequest.reason}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ngày tạo</p>
                <p className="text-sm font-medium">{formatDate(selectedRequest.createdTime)}</p>
              </div>
              {selectedRequest.updatedTime && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cập nhật lần cuối</p>
                  <p className="text-sm font-medium">{formatDate(selectedRequest.updatedTime)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedRequest.status === StatusLeaves.PENDING && (
              <div className="flex flex-col gap-2 pt-2">
                {/* Approve/Reject buttons - for managers */}
                {canApprove && onActionClick && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onActionClick(selectedRequest.id, 'approve', selectedRequest)
                      }}
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="size-4" />
                      Duyệt đơn
                    </Button>
                    <Button
                      onClick={() => {
                        onActionClick(selectedRequest.id, 'reject', selectedRequest)
                      }}
                      variant="destructive"
                      className="flex-1 gap-2"
                    >
                      <XCircle className="size-4" />
                      Từ chối
                    </Button>
                  </div>
                )}

                {/* Edit/Delete buttons - Only if user is the creator */}
                {canEditOrDelete && canEditOrDelete(selectedRequest) && (onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        onClick={() => {
                          onEdit(selectedRequest)
                          onOpenChange(false)
                        }}
                        className="flex-1 gap-2"
                        variant="outline"
                      >
                        <Edit className="size-4" />
                        Sửa đơn
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onDelete(selectedRequest)
                        }}
                        className="flex-1 gap-2"
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
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Không tìm thấy thông tin đơn đi muộn</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
