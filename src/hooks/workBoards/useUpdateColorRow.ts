import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateRowColorRequest, IUpdateRowColorResponse } from '@/types/WorkBoard'
import { handleCommonError } from '@/utils/handleErrors'

interface UseUpdateColorRowOptions {
  suppressInvalidation?: boolean
  sheetId?: number
}

export const useUpdateColorRow = (options?: UseUpdateColorRowOptions) => {
  const updateColorRowMutation = useMutation({
    mutationFn: async (payload: IUpdateRowColorRequest): Promise<IUpdateRowColorResponse> => {
      try {
        const response = (await POST(API_ENDPOINT.UPDATE_COLOR_ROW, {
          data: payload,
        })) as IUpdateRowColorResponse
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
        message: 'Lỗi khi cập nhật màu sắc hàng',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi cập nhật màu sắc hàng',
      })
    },
  })

  return { updateColorRowMutation }
}
