import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Clock, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import BottomSheet from '@/components/ui/bottom-sheet'

interface TimePickerProps {
  value?: string // Format: "HH:mm"
  onChange?: (time: string) => void
  placeholder?: string
  minTime?: string // Format: "HH:mm" - minimum time allowed
  disabled?: boolean
  className?: string
  variant?: 'popover' | 'bottomSheet' // 'popover' for web, 'bottomSheet' for mobile
}

function WheelPicker({
  items,
  selectedValue,
  onSelect,
  disabledItems,
  itemHeight = 44, // iOS standard item height
}: {
  items: number[]
  selectedValue: number | null
  onSelect: (value: number) => void
  disabledItems?: Set<number>
  itemHeight?: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | undefined>(undefined)
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)
  const lastScrollTop = useRef<number>(0)
  const velocityRef = useRef<number>(0)

  useEffect(() => {
    if (selectedValue !== null && scrollRef.current && !isScrolling) {
      const index = items.indexOf(selectedValue)
      if (index !== -1) {
        const scrollPosition = index * itemHeight
        // iOS uses instant scroll, not smooth animation
        scrollRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'auto',
        })
      }
    }
  }, [selectedValue, items, itemHeight, isScrolling])

  const handleScroll = () => {
    if (!scrollRef.current) return

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    setIsScrolling(true)

    const scrollTop = scrollRef.current.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const selectedItem = items[index]

    // Calculate velocity for momentum scrolling (iOS-like)
    const now = Date.now()
    const timeDiff = now - (touchStartTime.current || now)
    const scrollDiff = Math.abs(scrollTop - lastScrollTop.current)
    if (timeDiff > 0) {
      velocityRef.current = scrollDiff / timeDiff
    }
    lastScrollTop.current = scrollTop

    if (selectedItem !== undefined && selectedItem !== selectedValue) {
      onSelect(selectedItem)
    }

    // iOS-like snap behavior: wait longer for momentum to settle
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (scrollRef.current) {
        const currentScrollTop = scrollRef.current.scrollTop
        const currentIndex = Math.round(currentScrollTop / itemHeight)
        const targetScroll = currentIndex * itemHeight

        // Use instant scroll for iOS-like feel (no smooth animation)
        scrollRef.current.scrollTo({
          top: targetScroll,
          behavior: 'auto',
        })

        setIsScrolling(false)
        velocityRef.current = 0
      }
    }, 200) // Longer delay for iOS-like momentum
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    lastScrollTop.current = scrollRef.current?.scrollTop || 0
    velocityRef.current = 0
  }

  const handleTouchMove = () => {
    // Allow native scroll to handle touch move
    // This enables smooth momentum scrolling on mobile
    // Touch move is handled by native browser scrolling
  }

  const handleTouchEnd = () => {
    // iOS native behavior: let momentum scrolling finish naturally
    // The scroll handler will snap to the nearest item after momentum settles
    touchStartY.current = null
    touchStartTime.current = null
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return

    // Prevent default to have more control over scrolling
    e.preventDefault()

    setIsScrolling(true)

    // Get current scroll position
    const currentScrollTop = scrollRef.current.scrollTop
    const currentIndex = Math.round(currentScrollTop / itemHeight)

    // Calculate scroll delta (normalize for different browsers)
    const delta = e.deltaY > 0 ? 1 : -1

    // Calculate new index with bounds checking
    let newIndex = currentIndex + delta
    newIndex = Math.max(0, Math.min(newIndex, items.length - 1))

    // Calculate target scroll position
    const targetScroll = newIndex * itemHeight

    // Smooth scroll to target position
    scrollRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })

    // Update selection immediately
    const selectedItem = items[newIndex]
    if (selectedItem !== undefined && selectedItem !== selectedValue) {
      onSelect(selectedItem)
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set timeout to snap after wheel stops and ensure final position
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (scrollRef.current) {
        const finalScrollTop = scrollRef.current.scrollTop
        const finalIndex = Math.round(finalScrollTop / itemHeight)
        const finalScroll = finalIndex * itemHeight

        // Snap to exact position
        scrollRef.current.scrollTo({
          top: finalScroll,
          behavior: 'auto',
        })

        const finalSelectedItem = items[finalIndex]
        if (finalSelectedItem !== undefined && finalSelectedItem !== selectedValue) {
          onSelect(finalSelectedItem)
        }

        setIsScrolling(false)
      }
    }, 200)
  }

  return (
    <div className="relative flex-1 min-w-[85px]">
      {/* iOS-style selection indicator - two thin lines */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[44px] pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-gray-300 dark:bg-gray-600" />
        <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* iOS-style gradient overlays - more subtle */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-20" />

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="overflow-y-auto scrollbar-hide snap-y snap-mandatory touch-pan-y"
        style={{
          height: '216px', // iOS standard: 5 visible items * 44px - 4px
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          scrollBehavior: 'auto', // iOS uses instant scroll, not smooth
          pointerEvents: 'auto',
        }}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Padding top - iOS uses 2 items padding */}
        <div style={{ height: '88px' }} />

        {/* Items */}
        {items.map((item) => {
          const isSelected = selectedValue === item
          const isDisabled = disabledItems?.has(item) || false

          return (
            <div
              key={item}
              className={cn(
                'h-[44px] flex items-center justify-center snap-center cursor-pointer select-none touch-manipulation',
                // iOS-style typography: larger, bolder for selected
                isSelected
                  ? 'text-[21px] font-semibold text-foreground'
                  : isDisabled
                    ? 'text-[17px] text-muted-foreground/30 cursor-not-allowed'
                    : 'text-[17px] text-muted-foreground/60'
              )}
              onClick={() => !isDisabled && onSelect(item)}
              onTouchStart={() => !isDisabled && onSelect(item)}
            >
              {item.toString().padStart(2, '0')}
            </div>
          )
        })}

        {/* Padding bottom - iOS uses 2 items padding */}
        <div style={{ height: '88px' }} />
      </div>
    </div>
  )
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Chọn giờ',
  minTime,
  disabled = false,
  className,
  variant = 'popover',
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(
    value ? parseInt(value.split(':')[0]) : null
  )
  const [selectedMinute, setSelectedMinute] = useState<number | null>(
    value ? parseInt(value.split(':')[1]) : null
  )
  const [inputValue, setInputValue] = useState(value || '')
  const hasSetDefaultRef = useRef(false)
  const inputUpdateTimeoutRef = useRef<number | undefined>(undefined)
  const isUserTypingRef = useRef(false)

  // Set default value to 8:00 when opening picker if no value exists
  useEffect(() => {
    if (
      open &&
      !value &&
      selectedHour === null &&
      selectedMinute === null &&
      !hasSetDefaultRef.current
    ) {
      const defaultHour = 8
      const defaultMinute = 0
      setSelectedHour(defaultHour)
      setSelectedMinute(defaultMinute)
      const defaultTimeStr = `${defaultHour.toString().padStart(2, '0')}:${defaultMinute.toString().padStart(2, '0')}`
      setInputValue(defaultTimeStr)
      hasSetDefaultRef.current = true
      // Don't call onChange here to avoid flickering, only set local state
    }

    // Reset flag when picker closes
    if (!open) {
      hasSetDefaultRef.current = false
    }
  }, [open, value, selectedHour, selectedMinute])

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  // Calculate disabled items
  const disabledHours = useRef<Set<number>>(new Set())
  const disabledMinutes = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (minTime) {
      const [minHour] = minTime.split(':').map(Number)
      disabledHours.current = new Set(hours.filter((h) => h < minHour))
    } else {
      disabledHours.current = new Set()
    }
  }, [minTime, hours])

  useEffect(() => {
    if (minTime && selectedHour !== null) {
      const [minHour, minMinute] = minTime.split(':').map(Number)
      if (selectedHour === minHour) {
        disabledMinutes.current = new Set(minutes.filter((m) => m < minMinute))
      } else if (selectedHour > minHour) {
        disabledMinutes.current = new Set()
      } else {
        disabledMinutes.current = new Set(minutes)
      }
    } else {
      disabledMinutes.current = new Set()
    }
  }, [minTime, selectedHour, minutes])

  // Sync input value with prop value (only when picker is closed or value changes externally)
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number)
      // Only sync if values are different to avoid unnecessary updates
      if (selectedHour !== hour || selectedMinute !== minute) {
        setInputValue(value)
        setSelectedHour(hour)
        setSelectedMinute(minute)
        hasSetDefaultRef.current = false // Reset flag when value is set externally
      }
    } else if (!open) {
      // Only reset when picker is closed to avoid flickering
      setInputValue('')
      setSelectedHour(null)
      setSelectedMinute(null)
      hasSetDefaultRef.current = false
    }
  }, [value, open, selectedHour, selectedMinute])

  // Debounced update for inputValue to avoid flickering during scroll
  const updateInputValueDebounced = (hour: number, minute: number) => {
    if (isUserTypingRef.current) return // Don't update if user is typing

    if (inputUpdateTimeoutRef.current) {
      clearTimeout(inputUpdateTimeoutRef.current)
    }

    inputUpdateTimeoutRef.current = window.setTimeout(() => {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      setInputValue(timeStr)
    }, 100) // Wait 100ms after scroll stops
  }

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour)
    const minute = selectedMinute !== null ? selectedMinute : 30 // Default to 30 if no minute selected
    updateInputValueDebounced(hour, minute)
    // Don't call onChange here to avoid flickering, only update local state
  }

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute)
    const hour = selectedHour !== null ? selectedHour : 8 // Default to 8 if no hour selected
    updateInputValueDebounced(hour, minute)
    // Don't call onChange here to avoid flickering, only update local state
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    isUserTypingRef.current = true
    setInputValue(val)

    // Validate and parse time input (HH:mm format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/
    if (timeRegex.test(val)) {
      const [hour, minute] = val.split(':').map(Number)
      setSelectedHour(hour)
      setSelectedMinute(minute)
      // Don't call onChange here to avoid flickering, only update local state
    }

    // Reset typing flag after a short delay
    setTimeout(() => {
      isUserTypingRef.current = false
    }, 500)
  }

  const handleInputBlur = () => {
    isUserTypingRef.current = false
    // Validate on blur
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/
    if (!timeRegex.test(inputValue) || !isTimeValid(inputValue)) {
      setInputValue(value || '')
    } else {
      // Sync inputValue with selected values on blur
      if (selectedHour !== null && selectedMinute !== null) {
        const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
        setInputValue(timeStr)
      }
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (inputUpdateTimeoutRef.current) {
        clearTimeout(inputUpdateTimeoutRef.current)
      }
    }
  }, [])

  const isTimeValid = (time: string): boolean => {
    if (!time) return false

    // Always check against 8:00 minimum
    const [timeHour, timeMinute] = time.split(':').map(Number)

    // Check if time is after 8:00
    if (timeHour < 8) return false
    if (timeHour === 8 && timeMinute < 0) return false // This check is redundant but kept for clarity

    // If minTime is provided and is later than 8:00, check against minTime
    if (minTime) {
      const [minHour, minMinute] = minTime.split(':').map(Number)
      if (timeHour < minHour) return false
      if (timeHour === minHour && timeMinute < minMinute) return false
    }

    return true
  }

  // Check if current selected time is valid for confirm button
  const isConfirmDisabled = (): boolean => {
    if (selectedHour === null || selectedMinute === null) return true
    const currentTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
    return !isTimeValid(currentTime)
  }

  const displayValue = value
    ? `${value.split(':')[0].padStart(2, '0')}:${value.split(':')[1].padStart(2, '0')}`
    : placeholder

  // Picker content component (reusable for both Popover and BottomSheet)
  const PickerContent = () => (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Chọn thời gian</span>
          </div>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="HH:mm"
            className="h-11 text-center text-2xl font-bold tracking-wider w-28 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg bg-background"
            maxLength={5}
          />
          {minTime && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
              Min: {minTime}
            </div>
          )}
        </div>
      </div>

      {/* Wheel Picker */}
      <div className="px-4 sm:px-6 py-5 bg-background">
        <div className="flex items-center justify-center gap-5">
          {/* Hours Column */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Giờ
            </div>
            <WheelPicker
              items={hours}
              selectedValue={selectedHour}
              onSelect={handleHourSelect}
              disabledItems={disabledHours.current}
            />
          </div>

          {/* Separator */}
          <div className="flex items-center pt-12 pb-2">
            <div className="text-3xl font-bold text-foreground">:</div>
          </div>

          {/* Minutes Column */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Phút
            </div>
            <WheelPicker
              items={minutes}
              selectedValue={selectedMinute}
              onSelect={handleMinuteSelect}
              disabledItems={disabledMinutes.current}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t bg-muted/30 flex justify-end gap-3">
        <Button variant="outline" onClick={() => setOpen(false)} className="h-9 px-6 font-medium">
          Hủy
        </Button>
        <Button
          onClick={() => {
            if (!isConfirmDisabled() && selectedHour !== null && selectedMinute !== null) {
              const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
              onChange?.(timeStr)
            }
            setOpen(false)
          }}
          disabled={isConfirmDisabled()}
          className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xác nhận
        </Button>
      </div>
    </>
  )

  // Render based on variant
  if (variant === 'bottomSheet') {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn(
            'w-full justify-between font-normal h-11 bg-background hover:bg-accent/50 transition-all border-2',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
              <Clock className="size-4 text-primary" />
            </div>
            <span className={cn('text-sm font-medium', !value && 'text-muted-foreground')}>
              {displayValue}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              'size-4 opacity-50 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </Button>
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          title="Chọn thời gian"
          maxHeightClassName="max-h-[70vh]"
          padded={false}
        >
          <div className="flex flex-col">
            <PickerContent />
          </div>
        </BottomSheet>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between font-normal h-11 bg-background hover:bg-accent/50 transition-all border-2',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
              <Clock className="size-4 text-primary" />
            </div>
            <span className={cn('text-sm font-medium', !value && 'text-muted-foreground')}>
              {displayValue}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              'size-4 opacity-50 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border shadow-2xl rounded-xl bg-background max-w-sm"
        align="start"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'visible' }}
            >
              <PickerContent />
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}
