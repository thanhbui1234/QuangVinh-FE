import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WeeklyCalendarContent } from './WeeklyCalendarContent'

interface WeeklyCalendarWebProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function WeeklyCalendarWeb({
  open: controlledOpen,
  onOpenChange,
}: WeeklyCalendarWebProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(1) // Start with next week (weekOffset = 1)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lịch nghỉ phép tuần</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WeeklyCalendarContent
            weekOffset={weekOffset}
            onWeekOffsetChange={setWeekOffset}
            variant="web"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
