import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/constants'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRoles = (user.roles as UserRole[]) || []
  const allowed = allowedRoles.some((r) => userRoles.includes(r))

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
