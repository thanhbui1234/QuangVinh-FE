import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SelectOption {
  value: string | number
  label: string
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  placeholder?: string
  options: SelectOption[]
  className?: string
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  placeholder = 'Chọn...',
  options,
  className,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          value={field?.value?.toString()}
          onValueChange={(value) => {
            // Convert back to number if the option value is a number
            const option = options?.find((opt) => opt?.value?.toString() === value)
            field.onChange(option ? option?.value : value)
          }}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}
