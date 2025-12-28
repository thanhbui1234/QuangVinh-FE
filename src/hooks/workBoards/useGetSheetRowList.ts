import { useQuery } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { sheetRowsKey } from '@/constants/assignments/assignment'
import type {
  IGetSheetRowListRequest,
  IGetSheetRowListResponse,
  ISheetRow,
} from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

export const useGetSheetRowList = (
  sheetId: number | undefined,
  fromId: number = 0,
  size: number = 20
) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [sheetRowsKey.detail(sheetId || 0), fromId, size],
    queryFn: async (): Promise<IGetSheetRowListResponse> => {
      if (!sheetId) {
        throw new Error('Sheet ID is required')
      }

      try {
        const payload: IGetSheetRowListRequest = {
          sheetId,
          fromId: fromId || 0,
          size: size || 20,
        }

        const response = (await POST(
          API_ENDPOINT.GET_SHEET_ROW,
          payload
        )) as IGetSheetRowListResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    enabled: !!sheetId && sheetId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    rows: (data?.rows || []) as ISheetRow[],
    hasMore: data?.hasMore || false,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
