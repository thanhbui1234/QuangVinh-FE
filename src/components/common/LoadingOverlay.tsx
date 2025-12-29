import React from 'react'

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  message = 'Đang xử lý...',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg max-w-sm text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin shadow-lg" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Vui lòng đợi trong giây lát, hệ thống đang khởi tạo dữ liệu.
          </p>
        </div>
      </div>
    </div>
  )
}
