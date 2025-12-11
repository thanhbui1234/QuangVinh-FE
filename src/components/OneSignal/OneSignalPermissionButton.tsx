import { Bell, BellOff, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOneSignalPermission } from '@/hooks/useOneSignalPermission'
import { toast } from 'sonner'

interface OneSignalPermissionButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
}

export default function OneSignalPermissionButton({
  variant = 'outline',
  size = 'default',
  className,
  showIcon = true,
}: OneSignalPermissionButtonProps) {
  const { isRequesting, requestPermission, isGranted, isDenied } = useOneSignalPermission()

  const handleClick = async () => {
    if (isGranted) {
      toast.info('Thông báo đã được bật')
      return
    }

    if (isDenied) {
      toast.error('Bạn đã từ chối quyền thông báo. Vui lòng bật lại trong cài đặt trình duyệt.')
      return
    }

    try {
      const granted = await requestPermission()
      if (granted) {
        toast.success('Đã bật thông báo thành công!')
      } else {
        toast.error('Không thể bật thông báo. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast.error('Có lỗi xảy ra khi yêu cầu quyền thông báo')
    }
  }

  const getButtonText = () => {
    if (isRequesting) return 'Đang xử lý...'
    if (isGranted) return 'Thông báo đã bật'
    if (isDenied) return 'Bật lại thông báo'
    return 'Bật thông báo'
  }

  const getIcon = () => {
    if (isRequesting) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    if (isGranted) {
      return <CheckCircle2 className="h-4 w-4" />
    }
    if (isDenied) {
      return <BellOff className="h-4 w-4" />
    }
    return <Bell className="h-4 w-4" />
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isRequesting || isGranted}
      className={className}
    >
      {showIcon && getIcon()}
      {size !== 'icon' && getButtonText()}
    </Button>
  )
}
