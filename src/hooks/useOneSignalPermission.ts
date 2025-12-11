import { useState, useEffect, useCallback } from 'react'
import {
  getOneSignalPermissionStatus,
  requestOneSignalPermission,
} from '@/service/onesignal/initOneSignal'
import { registerPlayerIdToDashboard } from '@/service/onesignal/onesignalService'

type PermissionStatus = 'default' | 'granted' | 'denied' | null

export function useOneSignalPermission() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const checkPermission = useCallback(async () => {
    setIsLoading(true)
    try {
      const status = await getOneSignalPermissionStatus()
      setPermissionStatus(status)
    } catch (error) {
      console.error('Error checking OneSignal permission:', error)
      setPermissionStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true)
    try {
      const permission = await requestOneSignalPermission()
      setPermissionStatus(permission)

      if (permission === 'granted') {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          await registerPlayerIdToDashboard()
        } catch (error) {
          console.error('Error registering player ID:', error)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Error requesting OneSignal permission:', error)
      setPermissionStatus('denied')
      return false
    } finally {
      setIsRequesting(false)
    }
  }, [])

  useEffect(() => {
    checkPermission()

    const interval = setInterval(checkPermission, 5000)

    return () => clearInterval(interval)
  }, [checkPermission])

  return {
    permissionStatus,
    isLoading,
    isRequesting,
    checkPermission,
    requestPermission,
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
    isDefault: permissionStatus === 'default',
  }
}
