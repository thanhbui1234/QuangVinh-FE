import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
      <div className="p-3 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Đã có lỗi xảy ra</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Chúng tôi rất tiếc vì sự cố này. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ nếu lỗi
          vẫn tiếp diễn.
        </p>
      </div>
      {import.meta.env.DEV && (
        <pre className="mt-4 p-4 text-left bg-muted rounded-lg overflow-auto max-w-full text-xs font-mono">
          {error.message}
        </pre>
      )}
      <Button onClick={resetErrorBoundary} variant="default" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Thử lại
      </Button>
    </div>
  )
}

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
