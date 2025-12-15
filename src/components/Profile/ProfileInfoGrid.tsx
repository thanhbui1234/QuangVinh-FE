import type { Control } from 'react-hook-form'
import { FormInlineField } from './FormInlineField'
import type { ProfileFormData } from '@/schemas/profileSchema'

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
      <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
        {/* Name Field - Only show update button if changed */}
        <FormInlineField
          control={control}
          name="name"
          placeholder="Tên hiển thị"
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasNameChanged ? () => onUpdateField('name') : undefined}
        />

        <FormInlineField
          control={control}
          name="email"
          placeholder="Email"
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasEmailChanged ? () => onUpdateField('email') : undefined}
        />

        {/* Phone Field - Only show update button if changed */}
        <FormInlineField
          control={control}
          name="phone"
          placeholder="Số điện thoại"
          disabled={disabled}
          saving={isSaving}
          onUpdate={hasPhoneChanged ? () => onUpdateField('phone') : undefined}
        />
      </div>
    </>
  )
}

export default ProfileInfoGrid
