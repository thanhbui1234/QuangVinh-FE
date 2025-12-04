import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import SonnerToaster from '@/components/ui/toaster'
import { API_ENDPOINT } from '@/common'
import { queryClient } from '@/lib/queryClient'
import { leavesKey } from '@/constants/leaves/leaves.ts'
import type { LeaveFormValues } from '@/types/Leave.ts'

export const useCreateLeaves = () => {
  const { mutate } = useMutation({
    mutationFn: async (payload: LeaveFormValues) => {
      return await POST(API_ENDPOINT.CREATE_LEAVES, payload)
    },
    onSuccess: (respones) => {
      queryClient.invalidateQueries({ queryKey: [leavesKey.getAll] })
      SonnerToaster({
        type: 'success',
        message: 'Tạo đơn xin nghỉ thành công',
        description: respones.message,
      })
    },
  })

  return { createLeavesMutate: mutate }
}
