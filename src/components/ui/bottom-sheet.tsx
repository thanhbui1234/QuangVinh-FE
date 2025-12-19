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
  maxHeightClassName = 'max-h-[85dvh]',
  padded = true,
}: BottomSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'rounded-t-3xl z-[70] overflow-hidden',
          padded ? 'p-0' : 'p-0',
          contentClassName
        )}
      >
        <div className={cn('flex flex-col overflow-hidden', maxHeightClassName)}>
          {(title || description) && (
            <SheetHeader
              className={cn(
                'text-left flex-shrink-0',
                padded ? 'px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3' : 'p-3 sm:p-4 border-b'
              )}
            >
              {title && <SheetTitle className="text-lg font-bold sm:text-xl">{title}</SheetTitle>}
              {description && (
                <SheetDescription className="text-xs text-gray-500 sm:text-sm">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}
          <div
            className={cn(
              'flex-1 min-h-0 overflow-y-auto',
              padded ? 'px-3 sm:px-4' : '',
              className
            )}
          >
            {children}
          </div>
          {footer ? (
            <SheetFooter
              className={cn('flex-shrink-0', padded ? 'px-3 pb-3 sm:px-4 sm:pb-4' : 'p-3 sm:p-4')}
            >
              {footer}
            </SheetFooter>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BottomSheet
