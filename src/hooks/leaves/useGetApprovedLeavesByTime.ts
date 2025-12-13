import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api.ts'
import { API_ENDPOINT } from '@/common'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import type { GetApprovedLeavesByTimeParams } from '@/types/Leave.ts'

const useGetApprovedLeavesByTime = (params: GetApprovedLeavesByTimeParams) => {
  const { data, isFetching } = useQuery({
    queryKey: [leavesKey.getAll, 'approved-by-time', params],
    queryFn: async () => {
      const response = await POST(API_ENDPOINT.GET_APPROVED_LEAVES_BY_TIME, params, {
        rawResponse: true,
      })
      return response
    },
    enabled: !!params.fromTime && !!params.toTime,
    select: (response: any) => {
      // Handle both response structures: direct or wrapped in data
      if (response?.data?.absenceRequests) {
        return response.data.absenceRequests
      }
      if (response?.absenceRequests) {
        return response.absenceRequests
      }
      return []
    },
  })

  return {
    absenceRequests: data || [],
    isFetching,
  }
}

export default useGetApprovedLeavesByTime
