import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useState } from 'react'
import { Input } from '@/components/ui/input' // Kept as it's used in the component
import { Button } from '@/components/ui/button'

interface FormInlineFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  placeholder?: string
  disabled?: boolean
  saving?: boolean
  onUpdate?: () => void
}

export function FormInlineField<T extends FieldValues>({
  control,
  name,
  placeholder,
  disabled,
  saving,
  onUpdate,
}: FormInlineFieldProps<T>) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Input
            {...field}
            value={field.value || ''}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              field.onBlur()
            }}
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
          {fieldState.error && (
            <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

export default FormInlineField
