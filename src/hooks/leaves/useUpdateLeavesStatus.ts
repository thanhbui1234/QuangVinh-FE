import { useMutation } from '@tanstack/react-query'
import { POST } from '@/core/api'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { leavesKey } from '@/constants/leaves/leaves'
import SonnerToaster from '@/components/ui/toaster'
import { StatusLeaves } from '@/types/Leave.ts'

type UpdateLeavesStatusPayload = {
  absenceRequestId: number
  status: number
  newStatus: number
}

export const useUpdateLeavesStatus = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: UpdateLeavesStatusPayload) => {
      return await POST(API_ENDPOINT.UPDATE_LEAVES_STATUS, payload)
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [leavesKey.getAll] })
      const isApproved = variables.newStatus === StatusLeaves.APPROVED
      SonnerToaster({
        type: 'success',
        message: isApproved ? 'Duyệt đơn xin nghỉ thành công' : 'Từ chối đơn xin nghỉ thành công',
        description: response.message,
      })
    },
    onError: (error: any) => {
      SonnerToaster({
        type: 'error',
        message: 'Cập nhật trạng thái đơn thất bại',
        description: error?.message ?? 'Đã xảy ra lỗi, vui lòng thử lại.',
      })
    },
  })

  return { updateLeavesStatusMutate: mutate, isUpdatingStatus: isPending }
}
