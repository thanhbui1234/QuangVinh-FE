import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { useQuery } from '@tanstack/react-query'

interface UseStatisticsWorkBoardParams {
  sheetId: number
  columnName: string
}

export const useStatisticsWorkBoard = ({
  sheetId,
  columnName,
  enabled = true,
}: UseStatisticsWorkBoardParams & { enabled?: boolean }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [API_ENDPOINT.GET_STATISTICS_BY_COLUMN_WORKBOARD, sheetId, columnName],
    queryFn: () => POST(API_ENDPOINT.GET_STATISTICS_BY_COLUMN_WORKBOARD, { sheetId, columnName }),
    enabled: enabled && !!sheetId && !!columnName,
    refetchOnMount: 'always', // Always refetch when modal opens
    staleTime: 0, // Data is immediately stale, so it will refetch
  })
  return { data, isLoading, error }
}
