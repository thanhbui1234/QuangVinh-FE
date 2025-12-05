import type { Control } from 'react-hook-form'
import { FormInlineField } from './FormInlineField'
import type { ProfileFormData } from '@/schemas/profileSchema'

interface ProfileInfoGridProps {
  control: Control<ProfileFormData>
  isOwnProfile: boolean
  isLoading?: boolean
  isSaving?: boolean
  onUpdateField: (field: 'email' | 'phone' | 'position') => void
}

export const ProfileInfoGrid = ({
  control,
  isOwnProfile,
  isLoading,
  isSaving,
  onUpdateField,
}: ProfileInfoGridProps) => {
  const disabled = !isOwnProfile || !!isLoading

  return (
    <>
      <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
        <FormInlineField
          control={control}
          name="email"
          placeholder="Email"
          disabled={disabled}
          saving={isSaving}
          onUpdate={() => onUpdateField('email')}
        />
        <FormInlineField
          control={control}
          name="phone"
          placeholder="Số điện thoại"
          disabled={disabled}
          saving={isSaving}
          onUpdate={() => onUpdateField('phone')}
        />
        <FormInlineField
          control={control}
          name="position"
          placeholder="Chức vụ"
          disabled={disabled}
          saving={isSaving}
          onUpdate={() => onUpdateField('position')}
        />
      </div>
    </>
  )
}

export default ProfileInfoGrid
