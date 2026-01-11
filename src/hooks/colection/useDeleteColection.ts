import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import { useNavigate } from 'react-router-dom'

export const useDeleteColection = (hasNavigate?: boolean) => {
  const navigate = useNavigate()
  const deleteColectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await POST(API_ENDPOINT.DELETE_COLLECTION, { collectionId: id })
      return response
    },
    onSuccess: (respones) => {
      console.log(respones)
      queryClient.invalidateQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
      if (hasNavigate) {
        queryClient.refetchQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
        navigate('/filter/work-boards')
      }
      SonnerToaster({
        type: 'success',
        message: 'Xóa thành công',
        description: respones.message,
      })
    },
  })

  return { deleteColectionMutation }
}
