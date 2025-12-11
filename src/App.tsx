import './App.css'
import { RouterProvider } from 'react-router'
import router from './routers'
import OneSignalPermissionPrompt from './components/OneSignal/OneSignalPermissionPrompt'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <OneSignalPermissionPrompt />
    </>
  )
}

export default App
