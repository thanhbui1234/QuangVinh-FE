import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { colectionWorkBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'

interface ICreateColection {
  sheetId: number
  collectionId: number
}
export const useAddSheetCollection = () => {
  const addSheetCollectionMutation = useMutation({
    mutationFn: async (payload: ICreateColection) => {
      const response = await POST(API_ENDPOINT.ADD_SHEET_TO_COLLECTION, {
        ...payload,
        sheetSize: 25,
      })
      return response
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [colectionWorkBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Thêm sheet vào collection thành công',
        description: respones.message,
      })
    },
  })

  return { addSheetCollectionMutation }
}
