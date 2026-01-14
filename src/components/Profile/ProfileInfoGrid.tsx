import type { Control } from 'react-hook-form'
import { FormInlineField } from './FormInlineField'
import type { ProfileFormData } from '@/schemas/profileSchema'

import { User, Mail, Phone } from 'lucide-react'

interface ProfileInfoGridProps {
  control: Control<ProfileFormData>
  isOwnProfile: boolean
  isLoading?: boolean
  isSaving?: boolean
  onUpdateField: (field: 'name' | 'email' | 'phone' | 'position') => void
  hasNameChanged?: boolean
  hasEmailChanged?: boolean
  hasPhoneChanged?: boolean
}

export const ProfileInfoGrid = ({
  control,
  isOwnProfile,
  isLoading,
  isSaving,
  onUpdateField,
  hasNameChanged = false,
  hasEmailChanged = false,
  hasPhoneChanged = false,
}: ProfileInfoGridProps) => {
  const disabled = !isOwnProfile || !!isLoading

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {/* Name Field - Only show update button if changed */}
        <FormInlineField
          control={control}
          name="name"
          placeholder="Tên hiển thị"
          icon={<User className="size-4" />}
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasNameChanged ? () => onUpdateField('name') : undefined}
        />

        <FormInlineField
          control={control}
          name="email"
          placeholder="Email"
          icon={<Mail className="size-4" />}
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasEmailChanged ? () => onUpdateField('email') : undefined}
        />

        {/* Phone Field - Only show update button if changed */}
        <FormInlineField
          control={control}
          name="phone"
          placeholder="Số điện thoại"
          icon={<Phone className="size-4" />}
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasPhoneChanged ? () => onUpdateField('phone') : undefined}
        />
      </div>
    </>
  )
}

export default ProfileInfoGrid
