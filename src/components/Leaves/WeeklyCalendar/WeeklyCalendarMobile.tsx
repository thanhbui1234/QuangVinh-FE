import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BottomSheet from '@/components/ui/bottom-sheet'
import { WeeklyCalendarContent } from './WeeklyCalendarContent'
import { cn } from '@/lib/utils'

interface WeeklyCalendarMobileProps {
  className?: string
}

export default function WeeklyCalendarMobile({ className }: WeeklyCalendarMobileProps) {
  const [open, setOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(1) // Start with next week (weekOffset = 1)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn('w-full justify-start gap-2 h-12 text-left font-normal', className)}
      >
        <Calendar className="size-4" />
        <span>Xem lịch nghỉ phép tuần</span>
      </Button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Lịch nghỉ phép tuần"
        maxHeightClassName="max-h-[85vh] sm:max-h-[90vh]"
      >
        <WeeklyCalendarContent weekOffset={weekOffset} onWeekOffsetChange={setWeekOffset} />
      </BottomSheet>
    </>
  )
}
