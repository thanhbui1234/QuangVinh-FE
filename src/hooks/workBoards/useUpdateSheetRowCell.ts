import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
// import { sheetRowsKey } from '@/constants/assignments/assignment'
// import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateSheetRowCellRequest, IUpdateSheetRowCellResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

export const useUpdateSheetRowCell = () => {
  const updateSheetRowCellMutation = useMutation({
    mutationFn: async (
      payload: IUpdateSheetRowCellRequest
    ): Promise<IUpdateSheetRowCellResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.UPDATE_SHEET_ROW,
          payload
        )) as IUpdateSheetRowCellResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: () => {
      // Do not invalidate queries to avoid UI flickering/refreshing
      // The local state is already optimistic updated by the EditableTable component
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi cập nhật ô',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật ô',
      })
    },
  })

  return { updateSheetRowCellMutation }
}
