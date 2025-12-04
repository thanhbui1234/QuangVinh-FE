import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MobileHeaderProps = {
  title?: string
  subtitle?: string
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  blur?: boolean
  translucent?: boolean
  safeArea?: boolean
  heightClass?: string
  className?: string
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Ứng dụng',
  subtitle,
  leftSlot,
  rightSlot,
  showBack,
  onBack,
  blur = true,
  translucent = true,
  safeArea = true,
  heightClass = 'h-14',
  className,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Show back button ONLY when current route is within bottom navigation set.
  // Outside those routes: no back button.
  const bottomNavPaths = [
    '/mobile/dashboard',
    '/assignments',
    '/mobile/leaves',
    '/mobile/documents',
    '/mobile/profile',
  ]

  const inBottomNav = bottomNavPaths.includes(location.pathname)

  const computedShowBack =
    typeof showBack === 'boolean'
      ? showBack
      : inBottomNav && location.pathname !== '/mobile' && location.pathname !== '/mobile/dashboard'

  const handleBack = () => {
    if (onBack) return onBack()
    navigate(-1)
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b border-border',
        translucent ? 'bg-background/80' : 'bg-background',
        blur && 'backdrop-blur-md supports-[backdrop-filter]:bg-background/60',
        safeArea && 'pt-[env(safe-area-inset-top)]',
        className
      )}
    >
      <div className={cn('flex items-center px-3', heightClass)}>
        <div className="w-16 flex items-center">
          {leftSlot ??
            (computedShowBack && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-[60vw]">
            <div className="text-base font-semibold truncate">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
        </div>
        <div className="w-16 flex items-center justify-end">{rightSlot}</div>
      </div>
    </div>
  )
}

export default MobileHeader
