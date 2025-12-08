import useCheckRole from './useCheckRole.ts'
import { useAuthStore } from '@/stores/authStore'

interface UsePermissionProps {
  ownerId: string | number
  allowDirector?: boolean
}

export const usePermission = ({ ownerId, allowDirector }: UsePermissionProps) => {
  const { user } = useAuthStore()
  const { isDirectorPermission } = useCheckRole()

  const isOwner = user?.id === ownerId
  const isDirector = isDirectorPermission

  if (allowDirector) {
    return isOwner || isDirector
  }

  return isOwner
}
