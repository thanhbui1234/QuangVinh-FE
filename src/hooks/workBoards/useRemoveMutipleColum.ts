import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IRemoveColumnRequest, IRemoveColumnResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

// Define options type
interface UseRemoveMutipleColumnOptions {
  suppressInvalidation?: boolean
}

export const useRemoveMutipleColumn = (options?: UseRemoveMutipleColumnOptions) => {
  const removeColumnMutation = useMutation({
    mutationFn: async (payload: IRemoveColumnRequest[]): Promise<IRemoveColumnResponse> => {
      try {
        const response = (await POST(API_ENDPOINT.REMOVE_COLUMN, payload)) as IRemoveColumnResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      if (!options?.suppressInvalidation) {
        // Invalidate work board detail to refetch
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(variables[0].sheetId)] })
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      }
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi xóa cột',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xóa cột',
      })
    },
  })

  return { removeColumnMutation }
}
