import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import { POST } from '@/core/api.ts'
import { API_ENDPOINT } from '@/common'
import { type GetListLeavesParams, StatusLeaves, type LeavesRawResponse } from '@/types/Leave.ts'
import useCheckRole from '@/hooks/useCheckRole.ts'

const useGetLeavesList = (payload: GetListLeavesParams) => {
  const { isManagerPermission } = useCheckRole()
  const apiEndpoint = isManagerPermission
    ? API_ENDPOINT.GET_LIST_LEAVES_MANAGER
    : API_ENDPOINT.GET_LIST_LEAVES

  const stats = (stats: any) => {
    return {
      total: Object.values(stats).reduce((a: any, b: any) => a + b, 0),
      pending: stats[StatusLeaves.PENDING],
      approved: stats[StatusLeaves.APPROVED],
      rejected: stats[StatusLeaves.REJECTED],
    }
  }

  const { data, isFetching } = useQuery({
    queryKey: [leavesKey.getAll, payload],
    queryFn: async () => {
      const response = await POST(apiEndpoint, payload, {
        rawResponse: true,
      })
      console.log('resonse', response)

      return response
    },
    select(data: LeavesRawResponse) {
      return {
        creator: data.actionUser || '',
        absenceRequests: data.data.absenceRequests || [],
        statuses: data.data.statuses,
        statusCounts: stats(data?.data.statusCounts),
      }
    },
  })

  const absenceRequests = useMemo(() => {
    if (!data?.absenceRequests) return []
    return data.absenceRequests
  }, [data])

  const statusCounts = useMemo(() => {
    return data?.statusCounts
  }, [data])

  return {
    statusCounts,
    absenceRequests,
    statuses: data?.statuses || [],
    creator: data?.creator || '',
    isFetching,
  }
}

export default useGetLeavesList
