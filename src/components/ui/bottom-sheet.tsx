import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './sheet'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  maxHeightClassName?: string
  padded?: boolean
}

const BottomSheet = ({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
  contentClassName,
  maxHeightClassName = 'max-h-[85vh]',
  padded = true,
}: BottomSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'rounded-t-3xl z-[70]',
          maxHeightClassName,
          padded ? 'p-4 pb-6' : 'p-0',
          contentClassName
        )}
      >
        {(title || description) && (
          <SheetHeader className={cn('text-left', padded ? 'px-4 pb-4' : 'p-4 border-b')}>
            {title && <SheetTitle className="text-xl font-bold">{title}</SheetTitle>}
            {description && (
              <SheetDescription className="text-sm text-gray-500">{description}</SheetDescription>
            )}
          </SheetHeader>
        )}
        <div className={cn('contents', className)}>{children}</div>
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  )
}

export default BottomSheet
