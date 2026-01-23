import React from 'react'

const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    </div>
  )
}

export default PageLoader
