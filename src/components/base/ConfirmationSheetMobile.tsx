import BottomSheet from '@/components/ui/bottom-sheet.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { type LucideIcon } from 'lucide-react'
import React, { type ReactNode } from 'react'

type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success'

type ConfirmationSheetMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description?: string
  message: string
  confirmText?: string
  cancelText?: string
  icon?: LucideIcon | ReactNode
  variant?: ConfirmationVariant
  isLoading?: boolean
  loadingText?: string
  confirmButtonClassName?: string
  cancelButtonClassName?: string
}

const variantStyles: Record<
  ConfirmationVariant,
  {
    bg: string
    iconColor: string
    textColor: string
    titleColor: string
    buttonBg: string
    buttonHover: string
  }
> = {
  danger: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    textColor: 'text-rose-700 dark:text-rose-300',
    titleColor: 'text-rose-900 dark:text-rose-200',
    buttonBg: 'bg-rose-500',
    buttonHover: 'hover:bg-rose-600',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
    titleColor: 'text-amber-900 dark:text-amber-200',
    buttonBg: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-700 dark:text-blue-300',
    titleColor: 'text-blue-900 dark:text-blue-200',
    buttonBg: 'bg-blue-500',
    buttonHover: 'hover:bg-blue-600',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    titleColor: 'text-emerald-900 dark:text-emerald-200',
    buttonBg: 'bg-emerald-500',
    buttonHover: 'hover:bg-emerald-600',
  },
}

export default function ConfirmationSheetMobile({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  icon: Icon,
  variant = 'danger',
  isLoading = false,
  loadingText,
  confirmButtonClassName,
  cancelButtonClassName,
}: ConfirmationSheetMobileProps) {
  const styles = variantStyles[variant]

  const renderIcon = () => {
    if (!Icon) return null

    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon as React.ReactElement<any>, {
        className:
          `${(Icon as React.ReactElement<any>).props?.className || ''} ${styles.iconColor}`.trim(),
      })
    }

    if (typeof Icon === 'function') {
      const IconComponent = Icon as LucideIcon
      return <IconComponent className={`size-5 ${styles.iconColor}`} />
    }

    return null
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="space-y-4 pb-6">
        <div className={`${styles.bg} rounded-2xl p-4 space-y-2`}>
          {Icon && <div className="flex items-center gap-2">{renderIcon()}</div>}
          <p className={`text-sm ${styles.textColor} leading-relaxed`}>{message}</p>
        </div>

        <Separator className="opacity-60" />

        <div className="flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              confirmButtonClassName ||
              `w-full h-12 rounded-xl ${styles.buttonBg} text-white text-sm font-semibold ${styles.buttonHover} transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50`
            }
          >
            {isLoading ? loadingText || 'Đang xử lý...' : confirmText}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            variant="outline"
            className={
              cancelButtonClassName ||
              'w-full h-12 rounded-xl text-sm font-semibold border-gray-300 dark:border-gray-700'
            }
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
