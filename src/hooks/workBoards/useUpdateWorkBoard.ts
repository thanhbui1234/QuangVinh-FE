import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import type { IUpdateWorkBoard } from '@/types/WorkBoard'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import { mockWorkBoardsService } from '@/services/workBoards/mockWorkBoardsService'

export const useUpdateWorkBoard = () => {
  const updateWorkBoardMutation = useMutation({
    mutationFn: async (payload: IUpdateWorkBoard) => {
      return await mockWorkBoardsService.update(payload)
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(variables.id) })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật bảng công việc thành công',
        description: response.message || 'Bảng công việc đã được cập nhật thành công',
      })
    },
  })

  return { updateWorkBoardMutation }
}
