import { Outlet } from 'react-router'
import WebLayout from '../WebLayout'

const MainLayout = () => {
  return (
    <WebLayout>
      <Outlet />
    </WebLayout>
  )
}

export default MainLayout
