import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { registerPlayerIdToDashboard } from '@/service/onesignal/onesignalService'

export function useOneSignalPlayerId() {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const timer = setTimeout(async () => {
      try {
        await registerPlayerIdToDashboard()
      } catch (error) {
        console.error('Error registering Player ID:', error)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isAuthenticated])
}
