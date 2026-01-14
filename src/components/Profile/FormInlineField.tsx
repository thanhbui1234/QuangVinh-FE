import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormInlineFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  placeholder?: string
  icon?: React.ReactNode
  disabled?: boolean
  saving?: boolean
  onUpdate?: () => void
}

export function FormInlineField<T extends FieldValues>({
  control,
  name,
  placeholder,
  icon,
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
      render={({ field }) => (
        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative group/field">
            {icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within/field:text-primary transition-colors">
                {icon}
              </div>
            )}
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
              className={cn(
                'h-12 bg-white dark:bg-card border-border/10 rounded-2xl transition-all text-sm',
                icon && 'pl-11',
                (hovered || focused) && 'border-primary/30 shadow-sm'
              )}
            />
          </div>
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
      )}
    />
  )
}

export default FormInlineField
