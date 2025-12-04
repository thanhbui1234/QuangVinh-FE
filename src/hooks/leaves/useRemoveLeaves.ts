import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { leavesKey } from '@/constants/leaves/leaves'
import SonnerToaster from '@/components/ui/toaster'

type RemoveLeavePayload = {
  absenceRequestId: number
}

export const useRemoveLeaves = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: RemoveLeavePayload) => {
      return await POST(API_ENDPOINT.REMOVE_LEAVES, payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [leavesKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Xoá đơn nghỉ thành công',
        description: response.message,
      })
    },
    onError: (error: any) => {
      SonnerToaster({
        type: 'error',
        message: 'Xoá đơn nghỉ thất bại',
        description: error?.message ?? 'Đã xảy ra lỗi, vui lòng thử lại.',
      })
    },
  })

  return { removeLeavesMutate: mutate, isRemovingLeave: isPending }
}
