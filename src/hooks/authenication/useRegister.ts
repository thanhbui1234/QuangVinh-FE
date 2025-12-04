import { API_ENDPOINT } from '@/common'
import SonnerToaster from '@/components/ui/toaster'
import { POST } from '@/core/api'
import { setTokenAuth } from '@/utils/auth'
import { handleCommonError } from '@/utils/handleErrors'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import type { RegisterResponse } from '@/types/Auth'

export const useRegister = () => {
  const navigate = useNavigate()
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await POST(API_ENDPOINT.REGISTER, data)
      return response
    },
    onSuccess: (response: RegisterResponse) => {
      setTokenAuth(response.token as unknown as string, response.refreshToken as unknown as string)
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
