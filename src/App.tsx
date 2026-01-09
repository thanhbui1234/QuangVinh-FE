import './App.css'
import { RouterProvider } from 'react-router'
import router from './routers'
import { useEffect } from 'react'
import { runOneSignalInit } from '@/service/onesignalService/initOnesignal'

function App() {
  useEffect(() => {
    runOneSignalInit()
  }, [])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
