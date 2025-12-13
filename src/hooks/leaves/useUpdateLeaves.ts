import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import type { LeaveFormValues } from '@/types/Leave.ts'

type UpdateLeavePayload = LeaveFormValues & {
  id: number
}

export const useUpdateLeaves = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: UpdateLeavePayload) => {
      return await POST(API_ENDPOINT.UPDATE_LEAVES, payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [leavesKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Cập nhật đơn xin nghỉ thành công',
        description: response.message,
      })
    },
  })

  return { updateLeavesMutate: mutate, isUpdatePending: isPending }
}
