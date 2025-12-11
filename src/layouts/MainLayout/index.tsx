import { Outlet } from 'react-router'
import WebLayout from '../WebLayout'
import { useOneSignalPlayerId } from '@/hooks/notifications/useOneSignalPlayerId'

const MainLayout = () => {
  useOneSignalPlayerId()

  return (
    <WebLayout>
      <Outlet />
    </WebLayout>
  )
}

export default MainLayout
