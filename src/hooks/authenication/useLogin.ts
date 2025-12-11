import SonnerToaster from '@/components/ui/toaster'
import { POST } from '@/core/api'
import type { LoginFormData, LoginResponse } from '@/types/Auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { API_ENDPOINT } from '@/common'
import { requestOneSignalPermissionIfNeeded } from '@/service/onesignal/initOneSignal'

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

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const permissionGranted = await requestOneSignalPermissionIfNeeded()

        if (permissionGranted) {
          console.log('Notification permission đã được cấp')
        } else {
          console.log('Người dùng chưa cấp quyền thông báo')
        }
      } catch (error) {
        console.error('Lỗi khi xin quyền thông báo:', error)
      }

      navigate('/dashboard')
    },
  })

  return { loginMutation }
}
