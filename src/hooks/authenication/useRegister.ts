import { API_ENDPOINT } from '@/common'
import SonnerToaster from '@/components/ui/toaster'
import { publicPOST } from '@/core/api'
import { handleCommonError } from '@/utils/handleErrors'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import type { RegisterResponse } from '@/types/Auth'
import { useAuthStore } from '@/stores'

export const useRegister = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await publicPOST(API_ENDPOINT.REGISTER, data)
      return response
    },
    onSuccess: (response: RegisterResponse) => {
      const { user, token, refreshToken } = response
      setAuth(user, token, refreshToken)
      SonnerToaster({
        type: 'success',
        message: 'Đăng ký thành công',
      })
      navigate('/dashboard')
    },
    onError: (error) => {
      handleCommonError(error)
    },
  })

  return { registerMutation }
}
