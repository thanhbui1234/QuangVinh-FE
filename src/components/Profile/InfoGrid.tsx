import InlineField from './InlineField'

interface InfoGridProps {
  isOwnProfile: boolean
  isLoading?: boolean
  isSaving?: boolean
  email: string
  phone: string
  position: string
  onChangeEmail: (v: string) => void
  onChangePhone: (v: string) => void
  onChangePosition: (v: string) => void
  onUpdateField: (field: 'email' | 'phone' | 'position') => void
}

export const InfoGrid = ({
  isOwnProfile,
  isLoading,
  isSaving,
  email,
  phone,
  position,
  onChangeEmail,
  onChangePhone,
  onChangePosition,
  onUpdateField,
}: InfoGridProps) => {
  const disabled = !isOwnProfile || !!isLoading
  return (
    <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
      <InlineField
        value={email}
        placeholder="Email"
        disabled={disabled}
        saving={isSaving}
        onChange={onChangeEmail}
        onUpdate={() => onUpdateField('email')}
      />
      <InlineField
        value={phone}
        placeholder="Số điện thoại"
        disabled={disabled}
        saving={isSaving}
        onChange={onChangePhone}
        onUpdate={() => onUpdateField('phone')}
      />
      <InlineField
        value={position}
        placeholder="Chức vụ"
        disabled={disabled}
        saving={isSaving}
        onChange={onChangePosition}
        onUpdate={() => onUpdateField('position')}
      />
    </div>
  )
}

export default InfoGrid
