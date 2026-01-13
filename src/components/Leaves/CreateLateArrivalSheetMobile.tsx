import { Controller, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea.tsx'
import BottomSheet from '@/components/ui/bottom-sheet.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Clock, AlertCircle, FileText } from 'lucide-react'
import { LeavesType, DaysOffType, type LeaveFormValues } from '@/types/Leave.ts'
import { Label } from '@radix-ui/react-label'
import { useCreateLeaves } from '@/hooks/leaves/useCreateLeaves.ts'
import { useUpdateLeaves } from '@/hooks/leaves/useUpdateLeaves.ts'
import { useEffect, useMemo } from 'react'
import { TimePicker } from '@/components/ui/timePicker'
import { toast } from 'sonner'

type CreateLateArrivalSheetMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'update'
  leaveId?: number
  initialValues?: Partial<LeaveFormValues> | null
  onSuccess?: () => void
}

type LateArrivalFormValues = {
  arrivalTime: string // Time: HH:mm
  reason: string
}

export default function CreateLateArrivalSheetMobile({
  open,
  onOpenChange,
  mode = 'create',
  leaveId,
  initialValues,
  onSuccess,
}: CreateLateArrivalSheetMobileProps) {
  const { createLeavesMutate } = useCreateLeaves()
  const { updateLeavesMutate } = useUpdateLeaves()

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LateArrivalFormValues>({
    defaultValues: {
      arrivalTime: '',
      reason: initialValues?.reason ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'update' && initialValues) {
        // Parse offFrom to extract time only
        const offFromDate = initialValues.offFrom ? new Date(initialValues.offFrom) : null
        const timeStr = offFromDate
          ? `${offFromDate.getHours().toString().padStart(2, '0')}:${offFromDate.getMinutes().toString().padStart(2, '0')}`
          : ''

        reset({
          arrivalTime: timeStr,
          reason: initialValues.reason ?? '',
        })
      } else {
        reset({
          arrivalTime: '',
          reason: '',
        })
      }
    }
  }, [open, mode, initialValues, reset])

  // Calculate minimum time (7:30 AM) for today
  const minTime = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // If current time is after 7:30, use current time + 1 minute
    if (currentHour > 7 || (currentHour === 7 && currentMinute >= 30)) {
      const nextMinute = currentMinute + 1
      if (nextMinute >= 60) {
        return `${(currentHour + 1).toString().padStart(2, '0')}:00`
      }
      return `${currentHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
    }

    return '07:30'
  }, [])

  const validateTime = (time: string): boolean => {
    if (!time) return false

    const [hour, minute] = time.split(':').map(Number)
    const [minHour, minMinute] = minTime.split(':').map(Number)

    if (hour < minHour) return false
    if (hour === minHour && minute < minMinute) return false
    return true
  }

  const onSubmit = (value: LateArrivalFormValues) => {
    if (!value.arrivalTime) {
      toast.error('Vui lòng chọn giờ đi muộn')
      return
    }

    if (!validateTime(value.arrivalTime)) {
      toast.error(`Giờ đi muộn phải sau ${minTime} của ngày đã chọn`)
      return
    }

    if (!value.reason?.trim()) {
      toast.error('Vui lòng nhập lý do đi muộn')
      return
    }

    // Combine current date and selected time.
    // Với đơn đi muộn: ngày mặc định là ngày tạo đơn.
    const [hour, minute] = value.arrivalTime.split(':').map(Number)
    const dateObj = new Date()
    dateObj.setHours(hour, minute, 0, 0)
    const isoString = dateObj.toISOString()

    const payload: LeaveFormValues = {
      absenceType: LeavesType.LATE_ARRIVAL,
      dayOffType: DaysOffType.MORNING, // Default for late arrival
      dayOff: 0, // Late arrival doesn't count as a full day off
      offFrom: isoString,
      offTo: isoString, // Same as offFrom for late arrival
      reason: value.reason,
    }

    if (mode === 'update' && leaveId) {
      updateLeavesMutate(
        {
          id: leaveId,
          ...payload,
        },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        }
      )
    } else {
      createLeavesMutate(payload, {
        onSuccess: () => {
          onSuccess?.()
        },
      })
    }

    onOpenChange(false)
  }

  const formValues = watch()

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'update' ? 'Cập nhật đơn đi muộn' : 'Nộp đơn xin đi muộn'}
      description={
        mode === 'update'
          ? 'Cập nhật thông tin đơn đi muộn của bạn'
          : 'Điền thông tin để đăng ký đi muộn'
      }
      maxHeightClassName="max-h-[90vh]"
    >
      <form className="px-4 pb-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Time Selection */}
        <div className="space-y-2.5">
          <Label
            htmlFor="mobile-late-time"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <div className="p-1.5 rounded-md bg-muted">
              <Clock className="size-4 text-muted-foreground" />
            </div>
            <span>
              Giờ đi muộn <span className="text-destructive">*</span>
            </span>
          </Label>
          <div className="space-y-2">
            <Controller
              name="arrivalTime"
              control={control}
              rules={{
                required: 'Vui lòng chọn giờ đi muộn',
                validate: (value) => {
                  if (!value) return 'Vui lòng chọn giờ đi muộn'
                  if (!validateTime(value)) {
                    return `Giờ đi muộn phải sau ${minTime} của ngày hiện tại`
                  }
                  return true
                },
              }}
              render={({ field }) => (
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Chọn giờ đi muộn"
                  minTime={minTime}
                  variant="bottomSheet"
                />
              )}
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3 text-muted-foreground" />
              <span>
                <span className="font-semibold">Giờ vào làm: 7:30</span>. Vui lòng chọn thời gian
                sau 7:30 của ngày hiện tại.
              </span>
            </p>
          </div>
          {errors.arrivalTime && (
            <p className="text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-3.5" />
              {errors.arrivalTime.message}
            </p>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-2.5">
          <Label
            htmlFor="mobile-late-reason"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <div className="p-1.5 rounded-md bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <span>
              Lý do đi muộn <span className="text-destructive">*</span>
            </span>
          </Label>
          <Controller
            name="reason"
            control={control}
            rules={{ required: 'Vui lòng nhập lý do đi muộn' }}
            render={({ field }) => (
              <Textarea
                id="mobile-late-reason"
                placeholder="Nhập lý do đi muộn của bạn..."
                {...field}
                rows={4}
                className="min-h-[100px] resize-none rounded-xl border border-input bg-background transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60"
              />
            )}
          />
          {errors.reason && (
            <p className="text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-3.5" />
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl font-semibold"
            variant="outline"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={
              !formValues.arrivalTime ||
              !formValues.reason?.trim() ||
              !validateTime(formValues.arrivalTime)
            }
            className="flex-1 h-12 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'update' ? 'Cập nhật đơn' : 'Gửi đơn'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
