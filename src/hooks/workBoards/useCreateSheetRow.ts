import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { sheetRowsKey, workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { ICreateSheetRowRequest, ICreateSheetRowResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

export const useCreateSheetRow = () => {
  const createSheetRowMutation = useMutation({
    mutationFn: async (payload: ICreateSheetRowRequest): Promise<ICreateSheetRowResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.CREATE_SHEET_ROW,
          payload
        )) as ICreateSheetRowResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate sheet rows list to refetch
      queryClient.invalidateQueries({ queryKey: [sheetRowsKey.detail(variables.sheetId)] })
      // Also invalidate work board detail to update row count
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(variables.sheetId)] })
      SonnerToaster({
        type: 'success',
        message: 'Thêm hàng thành công',
        description: 'Hàng mới đã được thêm vào bảng',
      })
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi thêm hàng',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi thêm hàng',
      })
    },
  })

  return { createSheetRowMutation }
}
