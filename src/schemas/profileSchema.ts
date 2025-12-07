import { z } from 'zod'

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .regex(
      /^(?:\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
      'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam'
    )
    .optional()
    .or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof ProfileSchema>

export interface ProfileUpdatePayload extends ProfileFormData {
  avatar?: File
}
