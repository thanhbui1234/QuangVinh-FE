import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateColumnsRequest, IUpdateColumnsResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

// Define options type
interface UseUpdateColumnsOptions {
  suppressInvalidation?: boolean
}

export const useUpdateColumns = (options?: UseUpdateColumnsOptions) => {
  const updateColumnsMutation = useMutation({
    mutationFn: async (payload: IUpdateColumnsRequest): Promise<IUpdateColumnsResponse> => {
      try {
        const response = (await POST(
          API_ENDPOINT.UPDATE_COLUMNS,
          payload
        )) as IUpdateColumnsResponse
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
        message: 'Lỗi khi cập nhật danh sách cột',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật danh sách cột',
      })
    },
  })

  return { updateColumnsMutation }
}
