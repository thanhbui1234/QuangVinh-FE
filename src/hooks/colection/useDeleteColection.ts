import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

export const useDeleteColection = () => {
  const deleteColectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await POST(API_ENDPOINT.DELETE_COLLECTION, { collectionId: id })
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Xóa thành công',
        description: respones.message,
      })
    },
  })

  return { deleteColectionMutation }
}
