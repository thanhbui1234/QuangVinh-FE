'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  fromYear?: number
  disablePast?: boolean
  fromDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  fromYear,
  disablePast = false,
  fromDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If disablePast is true, set fromDate to today unless a specific fromDate is provided
  const minDate = disablePast ? fromDate || today : undefined

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-full justify-between font-normal">
            {value ? value.toLocaleDateString('vi-VN') : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            fromYear={fromYear || currentYear}
            toYear={currentYear + 10}
            disabled={(date) => {
              if (minDate && date < minDate) {
                return true
              }
              return false
            }}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
