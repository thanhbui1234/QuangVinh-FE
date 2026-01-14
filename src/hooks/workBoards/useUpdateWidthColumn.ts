import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateColumnsResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

interface UseUpdateWidthColumnOptions {
  suppressInvalidation?: boolean
}

/**
 * Hook to update width using the UPDATE_WIDTH_ROW endpoint (as requested by user)
 * This updates the width for the sheet/row context
 */
export const useUpdateWidthColumn = (options?: UseUpdateWidthColumnOptions) => {
  const updateWidthColumnMutation = useMutation({
    mutationFn: async (payload: {
      sheetId: number
      width: number
    }): Promise<IUpdateColumnsResponse> => {
      try {
        // Use UPDATE_WIDTH_ROW endpoint with simplified payload
        const response = (await POST(API_ENDPOINT.UPDATE_WIDTH_ROW, {
          data: {
            sheetId: payload.sheetId,
            width: payload.width,
          },
        })) as IUpdateColumnsResponse
        return response
      } catch (error) {
        handleCommonError(error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      if (!options?.suppressInvalidation) {
        queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(variables.sheetId) })
        queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      }
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi khi cập nhật độ rộng cột',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật độ rộng cột',
      })
    },
  })

  return { updateWidthColumnMutation }
}
