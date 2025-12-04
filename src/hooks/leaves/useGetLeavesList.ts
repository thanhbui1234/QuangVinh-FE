import { useQuery } from '@tanstack/react-query'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import { POST } from '@/core/api.ts'
import { API_ENDPOINT } from '@/common'
import type { LeavesListResponse, GetListLeavesParams } from '@/types/Leave.ts'
import useCheckRole from '@/hooks/useCheckRole.ts'

const useGetLeavesList = (payload: GetListLeavesParams) => {
  const { isManagerPermission } = useCheckRole()
  const apiEndpoint = isManagerPermission
    ? API_ENDPOINT.GET_LIST_LEAVES_MANAGER
    : API_ENDPOINT.GET_LIST_LEAVES

  const { data, isFetching } = useQuery({
    queryKey: [leavesKey.getAll, payload],
    queryFn: async () => {
      return await POST(apiEndpoint, payload)
    },
    select(data: LeavesListResponse) {
      return {
        absenceRequests: data.absenceRequests || [],
        statuses: data.statuses,
      }
    },
  })

  return {
    absenceRequests: data?.absenceRequests || [],
    statuses: data?.statuses || [],
    isFetching,
  }
}

export default useGetLeavesList
