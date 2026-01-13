import { Controller, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { LeavesType, DaysOffType, type LeaveFormValues } from '@/types/Leave.ts'
import { useCreateLeaves } from '@/hooks/leaves/useCreateLeaves.ts'
import { useUpdateLeaves } from '@/hooks/leaves/useUpdateLeaves.ts'
import { useEffect, useMemo } from 'react'
import { TimePicker } from '@/components/ui/timePicker'
import { toast } from 'sonner'

type CreateLateArrivalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'update'
  leaveId?: number
  initialValues?: Partial<LeaveFormValues> | null
}

type LateArrivalFormValues = {
  arrivalTime: string // Time: HH:mm
  reason: string
}

export default function CreateLateArrivalDialog({
  open,
  onOpenChange,
  mode = 'create',
  leaveId,
  initialValues,
}: CreateLateArrivalDialogProps) {
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

    // Combine date and time
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
      updateLeavesMutate({
        id: leaveId,
        ...payload,
      })
    } else {
      createLeavesMutate(payload)
    }

    onOpenChange(false)
  }

  const formValues = watch()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" animationVariant="fade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-md bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            {mode === 'update' ? 'Cập nhật đơn đi muộn' : 'Nộp đơn xin đi muộn'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'update'
              ? 'Cập nhật thông tin đơn đi muộn của bạn'
              : 'Điền thông tin để đăng ký đi muộn'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Time Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="late-time"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Clock className="size-4 text-muted-foreground" />
              <span>
                Giờ đi muộn <span className="text-destructive">*</span>
              </span>
            </Label>
            <div className="space-y-1">
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
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.arrivalTime.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label
              htmlFor="late-reason"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <FileText className="size-4 text-muted-foreground" />
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
                  id="late-reason"
                  placeholder="Nhập lý do đi muộn của bạn..."
                  {...field}
                  rows={4}
                  className="resize-none"
                />
              )}
            />
            {errors.reason && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6"
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
              className="gap-2 h-11 px-6"
            >
              <CheckCircle2 className="size-4" />
              {mode === 'update' ? 'Cập nhật đơn' : 'Gửi đơn đi muộn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
