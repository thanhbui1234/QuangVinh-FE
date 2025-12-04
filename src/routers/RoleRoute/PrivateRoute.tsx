import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
