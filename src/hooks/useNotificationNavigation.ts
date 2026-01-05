import { useNavigate } from 'react-router'
import { NotiType } from '@/constants'
import { useIsMobile } from '@/hooks/use-mobile'

interface UseNotificationNavigationProps {
  noti: any
  onSeen?: (id: number) => void
  notiType?: string | number
}

export const useNotificationNavigation = ({
  noti,
  onSeen,
  notiType,
}: UseNotificationNavigationProps) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const handleNavigate = () => {
    onSeen?.(noti.id)

    // Get notiType from prop or from noti object
    const currentNotiType = notiType || noti.notiType || noti.type
    const type = Number(currentNotiType)

    // Types 5,6: Navigate to group details (using extraId as groupId)
    if (type === NotiType.INVITE_MEMBER_GROUP || type === NotiType.REMOVE_MEMBER_GROUP) {
      const groupId = noti.extraId
      if (groupId) {
        navigate(`/assignments/${groupId}`)
      }
      return
    }

    // Types 8,9,10: Navigate to leaves page and show modal/sheet
    if (
      type === NotiType.CREATE_ABSENCE ||
      type === NotiType.APPROVE_ABSENCE ||
      type === NotiType.REJECT_ABSENCE
    ) {
      const absenceRequestId = noti.objectId
      if (absenceRequestId) {
        // Navigate to leaves page with query param
        const leavesPath = isMobile ? '/mobile/leaves' : '/personnel/leaves'
        navigate(`${leavesPath}?absenceRequestId=${absenceRequestId}`)
      }
      return
    }

    // Default: navigate to task (existing behavior)
    if (noti.extraId) {
      navigate(`/tasks/${noti.extraId}`)
    }
  }

  return { handleNavigate }
}
