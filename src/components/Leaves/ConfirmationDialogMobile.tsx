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

type ConfirmationDialogMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: 'approve' | 'reject' | null
  onConfirm: () => void
}

export default function ConfirmationDialogMobile({
  open,
  onOpenChange,
  actionType,
  onConfirm,
}: ConfirmationDialogMobileProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">
            {actionType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {actionType === 'approve'
              ? 'Bạn có chắc chắn muốn duyệt đơn xin nghỉ này không?'
              : 'Bạn có chắc chắn muốn từ chối đơn xin nghỉ này không?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="text-xs">
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
