import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

interface ICreateColection {
  name: string
  desc: string
  status: number // 1 active , 2 inactive, 3 archived
}
export const useCreateColection = () => {
  const createColectionMutation = useMutation({
    mutationFn: async (payload: ICreateColection) => {
      const response = await POST(API_ENDPOINT.CREATE_COLLECTION, payload)
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Tạo dự án thành công',
        description: respones.message,
      })
    },
  })

  return { createColectionMutation }
}
