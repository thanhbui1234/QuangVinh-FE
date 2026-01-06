'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function DialogConfirm({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  cancelLabel = 'Hủy',
  confirmLabel = 'Xóa',
  variant = 'destructive',
  icon,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => any
  title: string
  description: string
  cancelLabel?: string
  confirmLabel?: string
  variant?: 'default' | 'destructive'
  icon?: React.ReactNode
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-col items-center gap-2 text-center sm:text-center">
          <div
            className={cn(
              'rounded-full p-3 mb-2',
              variant === 'destructive' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
            )}
          >
            {icon || <AlertTriangle className="h-6 w-6" />}
          </div>
          <AlertDialogTitle className="text-xl font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-4 w-full mt-6 flex-row">
          <AlertDialogCancel className="mt-0 w-full sm:w-auto h-11 px-8 text-base">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              'w-full sm:w-auto h-11 px-8 text-base',
              variant === 'destructive'
                ? buttonVariants({ variant: 'destructive' })
                : buttonVariants({ variant: 'default' })
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
