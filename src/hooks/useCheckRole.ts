import { useMemo } from 'react'
import { ROLE } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
const useCheckRole = () => {
  const { user } = useAuthStore()
  const userId = user?.id

  const { isManagerPermission, isDirectorPermission } = useMemo(() => {
    const isDirector = user?.roles?.includes(ROLE.DIRECTOR)
    return {
      isManagerPermission: isDirector || user?.roles?.includes(ROLE.MANAGER),
      isDirectorPermission: isDirector,
    }
  }, [user?.roles])

  const hasPermission = useMemo(() => {
    return isManagerPermission || isDirectorPermission
  }, [isManagerPermission, isDirectorPermission])

  return { isManagerPermission, isDirectorPermission, hasPermission, userId, user }
}

export default useCheckRole
