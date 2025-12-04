import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface InlineFieldProps {
  value: string
  placeholder?: string
  disabled?: boolean
  saving?: boolean
  onChange: (value: string) => void
  onUpdate?: () => void
}

export const InlineField = ({
  value,
  placeholder,
  disabled,
  saving,
  onChange,
  onUpdate,
}: InlineFieldProps) => {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {!disabled && (hovered || focused) && onUpdate ? (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <Button
            size="sm"
            variant="secondary"
            disabled={saving}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onUpdate}
          >
            Cập nhật
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default InlineField
