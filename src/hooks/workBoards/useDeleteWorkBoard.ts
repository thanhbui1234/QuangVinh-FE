import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import { mockWorkBoardsService } from '@/services/workBoards/mockWorkBoardsService'

export const useDeleteWorkBoard = () => {
  const deleteWorkBoardMutation = useMutation({
    mutationFn: async (id: number) => {
      return await mockWorkBoardsService.delete(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Xóa bảng công việc thành công',
        description: response.message || 'Bảng công việc đã được xóa thành công',
      })
    },
  })

  return { deleteWorkBoardMutation }
}
