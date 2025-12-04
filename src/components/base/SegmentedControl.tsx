import { cn } from '@/lib/utils'

export type SegmentedOption = {
  label: string
  value: number[] // <-- array number
}

type SegmentedControlProps = {
  options: SegmentedOption[]
  value: number[] // <-- array number
  onChange: (value: number[]) => void
  className?: string
}
export function SegmentedControl(props: SegmentedControlProps) {
  const { options, value, onChange, className } = props

  const isSameArray = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i])

  return (
    <div className={cn('bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex gap-1', className)}>
      {options.map((opt) => {
        const active = isSameArray(value, opt.value)

        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
              active
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
