import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOneSignalPermission } from '@/hooks/useOneSignalPermission'
import { useAuthStore } from '@/stores/authStore'

export default function OneSignalPermissionPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const { permissionStatus, isRequesting, requestPermission } = useOneSignalPermission()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      return
    }

    const timer = setTimeout(() => {
      if (permissionStatus === 'default') {
        const hasShownPrompt = localStorage.getItem('onesignal_permission_prompt_shown')
        if (!hasShownPrompt) {
          setIsOpen(true)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [user, permissionStatus])

  const handleRequestPermission = async () => {
    const granted = await requestPermission()

    if (granted) {
      setIsOpen(false)
      localStorage.setItem('onesignal_permission_prompt_shown', 'true')
    } else {
      setIsOpen(false)
      localStorage.setItem('onesignal_permission_prompt_shown', 'true')
    }
  }

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem('onesignal_permission_prompt_shown', 'true')
  }

  if (!user || permissionStatus !== 'default' || !isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Bật thông báo đẩy</DialogTitle>
              <DialogDescription className="mt-1">
                Nhận thông báo quan trọng ngay cả khi bạn không mở ứng dụng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Cho phép ứng dụng gửi thông báo để bạn không bỏ lỡ các cập nhật quan trọng về công việc,
            nhiệm vụ và tin nhắn mới.
          </p>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} disabled={isRequesting}>
            Để sau
          </Button>
          <Button onClick={handleRequestPermission} disabled={isRequesting}>
            {isRequesting ? 'Đang xử lý...' : 'Bật thông báo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
