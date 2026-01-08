import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Eye, Clock, AlertCircle, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react'
import {
  getLeaveIcon,
  type LeavesListDataResponse,
  MappingLeavesType,
  mapDayOffType,
  StatusLeaves,
} from '@/types/Leave.ts'
import { calculateDays, formatDate } from '@/utils/CommonUtils.ts'

type ViewDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRequest: LeavesListDataResponse | null
  isLoading?: boolean
  onEdit?: (request: LeavesListDataResponse) => void
  onDelete?: (request: LeavesListDataResponse) => void
  canEditOrDelete?: (request: LeavesListDataResponse) => any
  canApprove?: boolean
  onActionClick?: (
    id: number,
    action: 'approve' | 'reject',
    request?: LeavesListDataResponse
  ) => void
}

export default function ViewDetailsDialog({
  open,
  onOpenChange,
  selectedRequest,
  isLoading = false,
  onEdit,
  onDelete,
  canEditOrDelete,
  canApprove = false,
  onActionClick,
}: ViewDetailsDialogProps) {
  const getTimeLeaves = () => {
    if (!selectedRequest?.offFrom && !selectedRequest?.offTo) return null
    const { days, hours } = calculateDays(selectedRequest.offFrom, selectedRequest.offTo)
    return { days, hours }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" animationVariant="fade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5" />
            Chi tiết đơn xin nghỉ
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về đơn xin nghỉ</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : selectedRequest ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Nhân viên</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={selectedRequest.creator?.avatar}
                      alt={selectedRequest.creator?.name}
                    />
                    <AvatarFallback>
                      {selectedRequest.creator?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">
                    {selectedRequest.creator?.name || selectedRequest.creator?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Loại nghỉ</Label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getLeaveIcon(selectedRequest.absenceType)
                    return <Icon className="size-4 text-muted-foreground" />
                  })()}
                  <p className="font-medium">
                    {MappingLeavesType[selectedRequest.absenceType] || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Chế độ nghỉ</Label>
                <p className="font-medium">{mapDayOffType[selectedRequest.dayOffType] || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Từ ngày</Label>
                <p className="font-medium">{formatDate(selectedRequest.offFrom)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Đến ngày</Label>
                <p className="font-medium">{formatDate(selectedRequest.offTo)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Số ngày nghỉ</Label>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <p className="font-medium">
                    {getTimeLeaves()?.days || 0} ngày {getTimeLeaves()?.hours || 0} giờ
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Trạng thái</Label>
                <div>
                  {selectedRequest.status === StatusLeaves.PENDING && (
                    <Badge variant="secondary" className="gap-1.5">
                      <AlertCircle className="size-3" />
                      Chờ duyệt
                    </Badge>
                  )}
                  {selectedRequest.status === StatusLeaves.APPROVED && (
                    <Badge className="gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                      <CheckCircle2 className="size-3" />
                      Đã duyệt
                    </Badge>
                  )}
                  {selectedRequest.status === StatusLeaves.REJECTED && (
                    <Badge className="gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0">
                      <XCircle className="size-3" />
                      Từ chối
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Lý do</Label>
              <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedRequest.reason}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Ngày tạo</Label>
              <p className="text-sm">{formatDate(selectedRequest.createdTime)}</p>
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
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Không tìm thấy thông tin đơn nghỉ</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
