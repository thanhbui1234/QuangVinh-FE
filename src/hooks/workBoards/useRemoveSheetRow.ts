import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { sheetRowsKey, workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IRemoveSheetRowRequest, IRemoveSheetRowResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

export const useRemoveSheetRow = () => {
  const removeSheetRowMutation = useMutation({
    mutationFn: async (payload: IRemoveSheetRowRequest): Promise<IRemoveSheetRowResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.REMOVE_SHEET_ROW,
          payload
        )) as IRemoveSheetRowResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate all sheet rows queries to refetch
      queryClient.invalidateQueries({ queryKey: [sheetRowsKey.getAll] })
      // Also invalidate work boards to update row count
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Xóa hàng thành công',
        description: 'Hàng đã được xóa khỏi bảng',
      })
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi xóa hàng',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xóa hàng',
      })
    },
  })

  return { removeSheetRowMutation }
}
