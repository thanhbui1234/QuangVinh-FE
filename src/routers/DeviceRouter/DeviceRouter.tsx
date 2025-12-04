import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useIsMobile } from '@/hooks/use-mobile'

interface DeviceRouterProps {
  children: React.ReactNode
}

export default function DeviceRouter({ children }: DeviceRouterProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  useEffect(() => {
    if (isMobile === undefined) return
    const currentPath = window.location.pathname
    if (!isMobile && currentPath.startsWith('/mobile')) {
      const webPath = currentPath.replace('/mobile', '') || '/dashboard'
      navigate(webPath, { replace: true })
    }
    if (
      isMobile &&
      !currentPath.startsWith('/mobile') &&
      currentPath !== '/login' &&
      currentPath !== '/register'
    ) {
      const mobilePath = currentPath ? `/mobile${currentPath}` : '/mobile/dashboard'
      navigate(mobilePath, { replace: true })
    }
  }, [isMobile, navigate])

  return <>{children}</>
}
