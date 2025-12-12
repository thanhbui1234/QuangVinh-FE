import './App.css'
import { RouterProvider } from 'react-router'
import router from './routers'
import { useEffect } from 'react'
import { initOneSignal } from '@/service/onesignalService/initOnesignal.ts'

function App() {
  useEffect(() => {
    initOneSignal()
  }, [])
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
