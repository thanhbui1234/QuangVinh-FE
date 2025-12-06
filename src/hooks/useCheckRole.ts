import { useMemo } from 'react'
import { ROLE } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
const useCheckRole = () => {
  const { user } = useAuthStore()
  const roles = user?.roles ?? []
  const userId = user?.id

  const { isManagerPermission, isDirectorPermission } = useMemo(() => {
    const isDirector = roles.includes(ROLE.DIRECTOR)
    return {
      isManagerPermission: isDirector || roles.includes(ROLE.MANAGER),
      isDirectorPermission: isDirector,
    }
  }, [roles])

  return { isManagerPermission, isDirectorPermission, userId }
}

export default useCheckRole
