import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    name: z.string().min(1, 'Tên là bắt buộc'),
    phone: z
      .string()
      .min(1, 'Số điện thoại là bắt buộc')
      .regex(
        /^(?:\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
        'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam'
      ),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu và xác nhận mật khẩu không khớp',
  })

export const createMemberSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})
