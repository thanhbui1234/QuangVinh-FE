import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { CheckCircle, XCircle } from 'lucide-react'

type ConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: 'approve' | 'reject' | null
  onConfirm: () => void
  isLoading?: boolean
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  actionType,
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {actionType === 'approve' ? (
              <CheckCircle className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
            {actionType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === 'approve'
              ? 'Bạn có chắc chắn muốn duyệt đơn xin nghỉ này không?'
              : 'Bạn có chắc chắn muốn từ chối đơn xin nghỉ này không?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              actionType === 'reject'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading
              ? actionType === 'approve'
                ? 'Đang duyệt...'
                : 'Đang từ chối...'
              : 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
