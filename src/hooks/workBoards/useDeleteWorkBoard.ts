import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { workBoardKey } from '@/constants/workboard/workboard'
import { queryClient } from '@/lib/queryClient'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common/apiEndpoint'

interface UseDeleteWorkBoardParams {
  sheetId: any
}
export const useDeleteWorkBoard = (params: UseDeleteWorkBoardParams) => {
  const deleteWorkBoardMutation = useMutation({
    mutationFn: async () => {
      await POST(API_ENDPOINT.DELETE_WORKBOARD, params)
    },
    onSuccess: () => {
      // Invalidate all queries related to workboards (lists, details)
      queryClient.refetchQueries({ queryKey: workBoardKey.all })
      SonnerToaster({
        type: 'success',
        message: 'Xóa bảng công việc thành công',
        description: 'Bảng công việc đã được xóa thành công',
      })
    },
  })

  return { deleteWorkBoardMutation }
}
