import SonnerToaster from '@/components/ui/toaster'
import { POST } from '@/core/api'
import type { LoginFormData, LoginResponse } from '@/types/Auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { API_ENDPOINT } from '@/common'
import { profileKey } from '@/constants'

export const useLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return POST(API_ENDPOINT.LOGIN, data)
    },

    onSuccess: async (response: LoginResponse) => {
      const { user, token, refreshToken } = response

      setAuth(user, token, refreshToken)

      // 👉 CALL QUERY SAU LOGIN
      await queryClient.fetchQuery({
        queryKey: [profileKey.detail(user.id.toString()), { id: user.id }],
        queryFn: () => POST(API_ENDPOINT.GET_PROFILE, { userId: user.id }),
      })

      SonnerToaster({
        type: 'success',
        message: 'Đăng nhập thành công',
      })

      navigate('/dashboard')
    },
  })

  return { loginMutation }
}
