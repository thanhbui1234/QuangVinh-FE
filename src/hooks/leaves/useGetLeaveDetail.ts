import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api.ts'
import { API_ENDPOINT } from '@/common'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import type { LeavesListDataResponse } from '@/types/Leave.ts'

interface GetLeaveDetailResponse {
  absenceRequestId: number
  absenceRequestDTO: {
    id: number
    creator: {
      id: number
      name: string
      email?: string
      avatar?: string
      phone?: string
    }
    approver?: {
      id: number
      name: string
      email?: string
      avatar?: string
      phone?: string
    }
    reason: string
    status: number
    dayOff: number
    absenceType: number
    dayOffType: number
    offFrom: string
    offTo: string
    createdTime?: string
    updatedTime?: string
  }
}

const useGetLeaveDetail = (absenceRequestId: number | null | undefined) => {
  const { data, isFetching, refetch } = useQuery({
    queryKey: [leavesKey.getAll, 'detail', absenceRequestId],
    queryFn: async () => {
      if (!absenceRequestId) return null

      try {
        const response: GetLeaveDetailResponse = await POST(
          API_ENDPOINT.GET_DETAIL_LEAVES,
          {
            absenceRequestId,
          },
          {
            rawResponse: true,
          }
        )

        // Debug: log response to see structure
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('useGetLeaveDetail - Raw response:', response)
          console.log('useGetLeaveDetail - Response type:', typeof response)
          console.log('useGetLeaveDetail - Response keys:', Object.keys(response || {}))
        }

        return response
      } catch (error) {
        console.error('useGetLeaveDetail - Error fetching detail:', error)
        throw error
      }
    },
    enabled: !!absenceRequestId,
    select: (response: GetLeaveDetailResponse | null): LeavesListDataResponse | null => {
      // Debug: log response in select
      if (import.meta.env.NODE_ENV === 'development') {
        console.log('useGetLeaveDetail - Response in select:', response)
      }

      if (!response) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('useGetLeaveDetail - No response')
        }
        return null
      }

      // Check if response has absenceRequestDTO directly or nested
      const absenceRequestDTO =
        response.absenceRequestDTO || (response as any).data?.absenceRequestDTO

      if (!absenceRequestDTO) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('useGetLeaveDetail - No absenceRequestDTO in response:', response)
        }
        return null
      }

      if (import.meta.env.NODE_ENV === 'development') {
        console.log('useGetLeaveDetail - absenceRequestDTO:', absenceRequestDTO)
      }

      // Map the response to match LeavesListDataResponse type
      const mapped = {
        id: absenceRequestDTO.id,
        creator: {
          id: absenceRequestDTO.creator.id,
          name: absenceRequestDTO.creator.name,
          email: absenceRequestDTO.creator.email || '',
          phone: absenceRequestDTO.creator.phone || '',
          avatar: absenceRequestDTO.creator.avatar,
        },
        approver: absenceRequestDTO.approver
          ? {
              id: absenceRequestDTO.approver.id,
              name: absenceRequestDTO.approver.name,
              email: absenceRequestDTO.approver.email || '',
              phone: absenceRequestDTO.approver.phone || '',
              avatar: absenceRequestDTO.approver.avatar,
            }
          : {
              id: 0,
              name: '',
              email: '',
              phone: '',
            },
        reason: absenceRequestDTO.reason,
        status: absenceRequestDTO.status as LeavesListDataResponse['status'],
        dayOff: absenceRequestDTO.dayOff,
        absenceType: absenceRequestDTO.absenceType as LeavesListDataResponse['absenceType'],
        dayOffType: absenceRequestDTO.dayOffType as LeavesListDataResponse['dayOffType'],
        offFrom: absenceRequestDTO.offFrom,
        offTo: absenceRequestDTO.offTo,
        createdTime: absenceRequestDTO.createdTime || '',
        updatedTime: absenceRequestDTO.updatedTime || '',
      }

      if (import.meta.env.NODE_ENV === 'development') {
        console.log('useGetLeaveDetail - Mapped result:', mapped)
      }

      return mapped
    },
  })

  return {
    absenceRequest: data || null,
    isFetching,
    refetch,
  }
}

export default useGetLeaveDetail
