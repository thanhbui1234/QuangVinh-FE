import SonnerToaster from '@/components/ui/toaster'
import { POST } from '@/core/api'
import type { LoginFormData, LoginResponse } from '@/types/Auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { API_ENDPOINT } from '@/common'

export const useLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await POST(API_ENDPOINT.LOGIN, data)
      return response
    },
    onSuccess: async (response: LoginResponse) => {
      const { user, token, refreshToken } = response
      SonnerToaster({
        type: 'success',
        message: 'Đăng nhập thành công',
      })
      setAuth(user, token, refreshToken)

      navigate('/dashboard')
    },
  })

  return { loginMutation }
}
