import { POST } from '@/core/api'
import { useMutation } from '@tanstack/react-query'
import { API_ENDPOINT } from '@/common'
import type { CreateMemberFormData } from '@/types'
import SonnerToaster from '@/components/ui/toaster'
import { queryClient } from '@/lib/queryClient'
import { personnelKey } from '@/constants/personnel/personnel'

export const useCreateMember = () => {
  const { data, mutate, isPending } = useMutation({
    mutationFn: async (payload: CreateMemberFormData) => {
      return await POST(API_ENDPOINT.CREATE_MEMBER, payload)
    },
    onSuccess: () => {
      SonnerToaster({
        type: 'success',
        message: 'Tạo tài khoản thành công',
        description: 'Nhân viên đã có thể sử dụng tài khoản',
      })
      queryClient.invalidateQueries({ queryKey: personnelKey.getAll })
    },
  })

  return { createMemberMutate: mutate, isPending, data }
}
