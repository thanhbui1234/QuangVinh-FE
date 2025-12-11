import { StrictMode } from 'react'
import App from './App.tsx'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SocketProvider } from './providers/SocketProvider.tsx'
import { Toaster } from 'sonner'
import { registerSW } from 'virtual:pwa-register'
import { initOneSignal } from '@/service/onesignal/initOneSignal'

const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
        <Toaster position="top-right" richColors />
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)

registerServiceWorker()
initOneSignal()
