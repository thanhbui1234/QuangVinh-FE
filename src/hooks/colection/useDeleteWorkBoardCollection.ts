import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

export const useDeleteWorkBoardCollection = (collectionId: number) => {
  const deleteWorkBoardCollectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await POST(API_ENDPOINT.ADD_SHEET_TO_COLLECTION, {
        sheetId: id,
        status: 0,
        collectionId: 0,
      })
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({
        queryKey: [colectionWorkBoardsKey.detail(collectionId.toString())],
      })
      SonnerToaster({
        type: 'success',
        message: 'Xóa thành công',
        description: respones.message,
      })
    },
    onError: (error) => {
      SonnerToaster({
        type: 'error',
        message: 'Xóa thất bại',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xóa',
      })
    },
  })

  return { deleteWorkBoardCollectionMutation }
}
