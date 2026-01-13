import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IAddColumnRequest, IAddColumnResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

// Define options type
interface UseAddColumnOptions {
  suppressInvalidation?: boolean
}

export const useAddColumn = (options?: UseAddColumnOptions) => {
  const addColumnMutation = useMutation({
    mutationFn: async (payload: IAddColumnRequest): Promise<IAddColumnResponse> => {
      try {
        const response = (await POST(API_ENDPOINT.ADD_COLUMN, payload)) as IAddColumnResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      if (!options?.suppressInvalidation) {
        // Invalidate work board detail to refetch
        queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(variables.sheetId) })
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      }
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi thêm cột',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi thêm cột',
      })
    },
  })

  return { addColumnMutation }
}
