import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { queryClient } from '@/lib/queryClient'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import type { CreateSheetPayload } from '@/types/Sheet'
import useCheckRole from '@/hooks/useCheckRole'
import { workBoardKey } from '@/constants/workboard/workboard.ts'

export const useCreateWorkBoard = () => {
  const { isManagerPermission } = useCheckRole()

  const createWorkBoardMutation = useMutation({
    mutationFn: async (payload: CreateSheetPayload) => {
      if (!isManagerPermission) {
        throw new Error('Chỉ có Manager hoặc Director mới có quyền tạo bảng dữ liệu.')
      }
      return await POST(API_ENDPOINT.CREATE_SHEET_INFO, payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [workBoardKey],
        refetchType: 'all',
      })
      SonnerToaster({
        type: 'success',
        message: 'Tạo bảng thành công',
        description: (response as any)?.message || 'Bảng dữ liệu đã được tạo thành công',
      })
    },
    onError: (error: any) => {
      SonnerToaster({
        type: 'error',
        message: 'Không thể tạo bảng',
        description:
          error?.message || 'Chỉ có Manager hoặc Director mới có quyền tạo bảng dữ liệu.',
      })
    },
  })

  return { createWorkBoardMutation }
}
