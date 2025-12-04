import { z } from 'zod'

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  position: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof ProfileSchema>

export interface ProfileUpdatePayload extends ProfileFormData {
  avatar?: File
}
