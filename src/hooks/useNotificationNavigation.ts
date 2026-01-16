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

    // Handle URL from backend - convert to mobile route if needed
    if (noti.url) {
      let url = noti.url

      // Remove leading slash if present
      if (url.startsWith('/')) {
        url = url.substring(1)
      }

      // Extract query params from URL
      const extractQueryParams = (urlString: string) => {
        const queryIndex = urlString.indexOf('?')
        if (queryIndex === -1) return { path: urlString, params: new URLSearchParams() }

        const path = urlString.substring(0, queryIndex)
        const queryString = urlString.substring(queryIndex + 1)
        const params = new URLSearchParams(queryString)
        return { path, params }
      }

      const { path, params } = extractQueryParams(url)

      // Convert personnel/leaves to mobile/schedule?tab=leaves on mobile
      if (isMobile && path === 'personnel/leaves') {
        const absenceRequestId = params.get('absenceRequestId')
        if (absenceRequestId) {
          navigate(`/mobile/schedule?tab=leaves&absenceRequestId=${absenceRequestId}`)
        } else {
          navigate(`/mobile/schedule?tab=leaves`)
        }
        return
      }

      // Convert personnel/late-arrival to mobile/schedule?tab=late-arrival on mobile
      if (isMobile && path === 'personnel/late-arrival') {
        const absenceRequestId = params.get('absenceRequestId')
        if (absenceRequestId) {
          navigate(`/mobile/schedule?tab=late-arrival&absenceRequestId=${absenceRequestId}`)
        } else {
          navigate(`/mobile/schedule?tab=late-arrival`)
        }
        return
      }

      // For web or other URLs, navigate as-is
      navigate(`/${url}`)
      return
    }

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
        // Navigate to schedule page with leaves tab and query param
        if (isMobile) {
          navigate(`/mobile/schedule?tab=leaves&absenceRequestId=${absenceRequestId}`)
        } else {
          navigate(`/personnel/leaves?absenceRequestId=${absenceRequestId}`)
        }
      }
      return
    }

    // Types 11,12,13: Navigate to late arrival page and show modal/sheet
    if (
      type === NotiType.CREATE_LATELY_CHECKIN ||
      type === NotiType.APPROVE_LATELY_CHECKIN ||
      type === NotiType.REJECT_LATELY_CHECKIN
    ) {
      const absenceRequestId = noti.objectId
      if (absenceRequestId) {
        // Navigate to schedule page with late-arrival tab and query param
        if (isMobile) {
          navigate(`/mobile/schedule?tab=late-arrival&absenceRequestId=${absenceRequestId}`)
        } else {
          navigate(`/personnel/late-arrival?absenceRequestId=${absenceRequestId}`)
        }
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
