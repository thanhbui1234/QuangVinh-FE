import { Bell, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface NotificationPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAllow: () => void
  onDeny?: () => void
}

export function NotificationPermissionDialog({
  open,
  onOpenChange,
  onAllow,
  onDeny,
}: NotificationPermissionDialogProps) {
  const handleAllow = () => {
    onAllow()
    onOpenChange(false)
  }

  const handleDeny = () => {
    onDeny?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[380px] w-[calc(100vw-2rem)] sm:w-[calc(100%-2rem)] mx-auto p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-lg border-0 shadow-2xl"
        animationVariant="slide-up"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header với gradient background */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background pt-6 pb-5 sm:pt-8 sm:pb-6 px-4 sm:px-6">
          <div className="relative">
            <DialogHeader className="text-center space-y-3 sm:space-y-4">
              {/* Icon với animation và gradient */}
              <div className="mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-4 ring-primary/20">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-in zoom-in-95 duration-300" />
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground pt-2">
                Bật thông báo
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Cho phép ứng dụng gửi thông báo để bạn không bỏ lỡ các cập nhật quan trọng
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Footer với buttons */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 space-y-3">
          <Button
            onClick={handleAllow}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
          >
            Cho phép thông báo
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeny}
            className="w-full h-10 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Không, cảm ơn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
