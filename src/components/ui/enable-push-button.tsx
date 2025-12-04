import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUserToPush, triggerTestPush } from '@/service/push/pushService'

export function EnablePushButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnablePush = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await subscribeUserToPush()
      setIsEnabled(true)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Không thể bật thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPush = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await triggerTestPush()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Không thể gửi thông báo thử')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleEnablePush} disabled={isLoading || isEnabled} variant="outline">
        {isEnabled
          ? 'Đã bật thông báo hệ thống'
          : isLoading
            ? 'Đang xử lý...'
            : 'Bật thông báo hệ thống'}
      </Button>
      <Button onClick={handleTestPush} disabled={!isEnabled || isLoading} variant="secondary">
        Gửi thông báo thử
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
