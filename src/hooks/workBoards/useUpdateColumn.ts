import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateColumnRequest, IUpdateColumnResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

export const useUpdateColumn = () => {
  const updateColumnMutation = useMutation({
    mutationFn: async (payload: IUpdateColumnRequest): Promise<IUpdateColumnResponse> => {
      try {
        const response = (await POST(API_ENDPOINT.UPDATE_COLUMN, payload)) as IUpdateColumnResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate work board detail to refetch
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(variables.sheetId)] })
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi cập nhật cột',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật cột',
      })
    },
  })

  return { updateColumnMutation }
}
