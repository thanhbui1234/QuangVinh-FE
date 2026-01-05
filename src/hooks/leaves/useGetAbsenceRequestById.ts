import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api.ts'
import { API_ENDPOINT } from '@/common'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import type { LeavesListDataResponse } from '@/types/Leave.ts'
import useCheckRole from '@/hooks/useCheckRole.ts'

const useGetAbsenceRequestById = (absenceRequestId: number | null | undefined) => {
  const { isManagerPermission } = useCheckRole()
  const apiEndpoint = isManagerPermission
    ? API_ENDPOINT.GET_LIST_LEAVES_MANAGER
    : API_ENDPOINT.GET_LIST_LEAVES

  const { data, isFetching, refetch } = useQuery({
    queryKey: [leavesKey.getAll, 'by-id', absenceRequestId],
    queryFn: async () => {
      if (!absenceRequestId) return null

      const response = await POST(
        apiEndpoint,
        {
          statuses: [0, 1, 2], // All statuses: PENDING, APPROVED, REJECTED
          offset: 0,
          limit: 1000, // Large limit to ensure we find the request
        },
        {
          rawResponse: true,
        }
      )

      return response
    },
    enabled: !!absenceRequestId,
    select: (response: any): LeavesListDataResponse | null => {
      if (!response?.data?.absenceRequests) return null

      const absenceRequests: LeavesListDataResponse[] = response.data.absenceRequests
      const foundRequest = absenceRequests.find((req) => req.id === absenceRequestId)

      return foundRequest || null
    },
  })

  return {
    absenceRequest: data || null,
    isFetching,
    refetch,
  }
}

export default useGetAbsenceRequestById
