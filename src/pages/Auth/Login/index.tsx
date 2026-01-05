import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema } from '@/schemas/Auth'
import { useNavigate } from 'react-router'
import type { LoginFormData } from '@/types/Auth'
import { useLogin } from '@/hooks/authenication/useLogin'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { loginMutation } = useLogin()

  const onSubmit = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data)
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="  rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Đăng nhập</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                {...register('email')}
                type="text"
                placeholder="Username"
                className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-black dark:text-black"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-black dark:text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Quên mật khẩu
            </button>
          </div>
        </form>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <span className="text-gray-600 text-sm">Chưa có tài khoản? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
