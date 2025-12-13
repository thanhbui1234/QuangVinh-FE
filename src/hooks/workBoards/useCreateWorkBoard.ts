import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import type { ICreateWorkBoard } from '@/types/WorkBoard'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { queryClient } from '@/lib/queryClient'
import { mockWorkBoardsService } from '@/services/workBoards/mockWorkBoardsService'

export const useCreateWorkBoard = () => {
  const createWorkBoardMutation = useMutation({
    mutationFn: async (payload: ICreateWorkBoard) => {
      return await mockWorkBoardsService.create(payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Tạo bảng công việc thành công',
        description: response.message || 'Bảng công việc đã được tạo thành công',
      })
    },
  })

  return { createWorkBoardMutation }
}
