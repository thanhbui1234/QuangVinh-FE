import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateRowHeightRequest, IUpdateRowHeightResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

interface UseUpdateHeightRowOptions {
  suppressInvalidation?: boolean
  sheetId?: number
}

export const useUpdateHeightRow = (options?: UseUpdateHeightRowOptions) => {
  const updateHeightRowMutation = useMutation({
    mutationFn: async (payload: IUpdateRowHeightRequest): Promise<IUpdateRowHeightResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.UPDATE_HEIGHT_ROW,
          payload
        )) as IUpdateRowHeightResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: () => {
      if (!options?.suppressInvalidation && options?.sheetId) {
        queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(options.sheetId) })
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      }
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi cập nhật chiều cao hàng',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật chiều cao hàng',
      })
    },
  })

  return { updateHeightRowMutation }
}
