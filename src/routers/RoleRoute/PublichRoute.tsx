import { Navigate } from 'react-router'
import { isAuthenticated } from '@/utils/auth'

export default function PublichRoute({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
