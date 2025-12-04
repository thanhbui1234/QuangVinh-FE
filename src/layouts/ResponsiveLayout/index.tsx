import { Outlet } from 'react-router'
import WebLayout from '../WebLayout'
import MobileLayout from '../MobileLayout'
import { useIsMobile } from '@/hooks/use-mobile'

const ResponsiveLayout = () => {
  const isMobile = useIsMobile()

  if (isMobile) {
    // Mobile layout renders an Outlet internally; mimic structure
    return <MobileLayout />
  }

  return (
    <WebLayout>
      <Outlet />
    </WebLayout>
  )
}

export default ResponsiveLayout
