import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

interface IUpdateColection {
  collectionId: number
  name?: string
  desc?: string
  status?: number
}

export const useUpdateColection = (collectionId?: number) => {
  const updateColectionMutation = useMutation({
    mutationFn: async (payload: IUpdateColection) => {
      const response = await POST(API_ENDPOINT.UPDATE_COLLECTION, payload)
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
      if (collectionId) {
        queryClient.invalidateQueries({
          queryKey: [colectionWorkBoardsKey.detail(collectionId.toString())],
        })
      }
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật thành công',
        description: respones.message,
      })
    },
  })

  return { updateColectionMutation }
}
