import { Controller, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
  Calendar,
  Heart,
  Plane,
  Briefcase,
  CheckCircle2,
  Plus,
  Sun,
  Sunset,
  CalendarRange,
} from 'lucide-react'
import { DaysOffType, LeavesType, type LeaveFormValues } from '@/types/Leave.ts'
import { cn } from '@/lib/utils'
import { useCreateLeaves } from '@/hooks/leaves/useCreateLeaves.ts'
import { useUpdateLeaves } from '@/hooks/leaves/useUpdateLeaves.ts'
import { convertToISO } from '@/utils/CommonUtils.ts'
import { useEffect } from 'react'
import { DatePicker } from '@/components/ui/datePicker'
import { parseDate, formatToDateString } from '@/utils/CommonUtils'

type CreateLeaveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'update'
  leaveId?: number
  initialValues?: Partial<LeaveFormValues> | null
}

export default function CreateLeaveDialog({
  open,
  onOpenChange,
  mode = 'create',
  leaveId,
  initialValues,
}: CreateLeaveDialogProps) {
  const { createLeavesMutate } = useCreateLeaves()
  const { updateLeavesMutate } = useUpdateLeaves()

  const leaveModeOptions = [
    { value: DaysOffType.MORNING, label: 'Buổi sáng', icon: Sun },
    { value: DaysOffType.AFTERNOON, label: 'Buổi chiều', icon: Sunset },
    { value: DaysOffType.ALLDAY, label: 'Cả ngày', icon: Calendar },
    { value: DaysOffType.MULTIPLE_DAY, label: 'Nghỉ theo ngày', icon: CalendarRange },
  ] as const

  const { control, handleSubmit, watch, reset } = useForm<LeaveFormValues>({
    defaultValues: {
      absenceType: initialValues?.absenceType ?? LeavesType.SICK,
      dayOffType: initialValues?.dayOffType ?? DaysOffType.MORNING,
      dayOff: initialValues?.dayOff ?? 0.5,
      offFrom: initialValues?.offFrom ?? '',
      offTo: initialValues?.offTo ?? '',
      reason: initialValues?.reason ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'update' && initialValues) {
        reset({
          absenceType: initialValues.absenceType ?? LeavesType.SICK,
          dayOffType: initialValues.dayOffType ?? DaysOffType.MORNING,
          dayOff: initialValues.dayOff ?? 0.5,
          offFrom: initialValues.offFrom ?? '',
          offTo: initialValues.offTo ?? '',
          reason: initialValues.reason ?? '',
        })
      } else {
        reset({
          absenceType: LeavesType.SICK,
          dayOffType: DaysOffType.MORNING,
          dayOff: 0.5,
          offFrom: '',
          offTo: '',
          reason: '',
        })
      }
    }
  }, [open, mode, initialValues, reset])

  const onSubmit = (value: LeaveFormValues) => {
    if (value) {
      const offFromDate = new Date(value.offFrom)
      const offToDate = new Date(value.offTo || value.offFrom)
      const diffTime = offToDate.getTime() - offFromDate.getTime()
      const dayOff = diffTime / (1000 * 60 * 60 * 24) || 0.5

      const payload: LeaveFormValues = {
        ...value,
        dayOff: value.offTo ? dayOff : 0.5,
        offFrom: convertToISO(value.offFrom),
        offTo: value.offTo ? convertToISO(value.offTo) : convertToISO(value.offFrom),
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
  }

  const formValues = watch()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" animationVariant="fade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            {mode === 'update' ? 'Cập nhật đơn xin nghỉ' : 'Tạo đơn xin nghỉ'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'update'
              ? 'Cập nhật thông tin đơn xin nghỉ'
              : 'Điền thông tin để gửi đơn xin nghỉ mới'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loại nghỉ */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="leave-type">
                Loại nghỉ <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="absenceType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value.toString()}
                    onValueChange={(val) => field.onChange(Number(val) as LeavesType)}
                  >
                    <SelectTrigger id="leave-type" className="w-full">
                      <SelectValue placeholder="Chọn loại nghỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LeavesType.SPECIAL.toString()}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4" />
                          Đặc biệt
                        </div>
                      </SelectItem>
                      <SelectItem value={LeavesType.YEARLY.toString()}>
                        <div className="flex items-center gap-2">
                          <Plane className="size-4" />
                          Nghỉ phép năm
                        </div>
                      </SelectItem>
                      <SelectItem value={LeavesType.SICK.toString()}>
                        <div className="flex items-center gap-2">
                          <Heart className="size-4" />
                          Nghỉ ốm
                        </div>
                      </SelectItem>
                      <SelectItem value={LeavesType.NO_SALARY.toString()}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4" />
                          Nghỉ không lương
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Chế độ nghỉ */}
            <div className="md:col-span-2 space-y-2">
              <Label>
                Chế độ nghỉ <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="dayOffType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {leaveModeOptions.map((option) => {
                      const Icon = option.icon
                      const isActive = field.value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            isActive
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-background hover:border-primary/50'
                          )}
                        >
                          <Icon className="size-5" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>

            {/* Date pickers */}
            {formValues.dayOffType && (
              <>
                {formValues.dayOffType === DaysOffType.MULTIPLE_DAY ? (
                  <>
                    <Controller
                      name="offFrom"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="start-date">
                            Từ ngày <span className="text-destructive">*</span>
                          </Label>
                          <DatePicker
                            value={parseDate(field.value)}
                            onChange={(date) =>
                              field.onChange(date ? formatToDateString(date) : '')
                            }
                            placeholder="Chọn ngày bắt đầu"
                            disablePast={true}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name="offTo"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="end-date">
                            Đến ngày <span className="text-destructive">*</span>
                          </Label>
                          <DatePicker
                            value={parseDate(field.value)}
                            onChange={(date) =>
                              field.onChange(date ? formatToDateString(date) : '')
                            }
                            placeholder="Chọn ngày kết thúc"
                            disablePast={true}
                          />
                        </div>
                      )}
                    />
                  </>
                ) : (
                  <Controller
                    name="offFrom"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="leave-date">
                          Ngày nghỉ <span className="text-destructive">*</span>
                        </Label>
                        <DatePicker
                          value={parseDate(field.value)}
                          onChange={(date) => field.onChange(date ? formatToDateString(date) : '')}
                          placeholder="Chọn ngày nghỉ"
                          disablePast={true}
                        />
                      </div>
                    )}
                  />
                )}
              </>
            )}

            {/* Lý do */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="reason">
                Lý do xin nghỉ <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Textarea id="reason" placeholder="Nhập lý do xin nghỉ..." {...field} rows={3} />
                )}
              />
            </div>

            {/* Action buttons */}
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  !formValues.absenceType ||
                  !formValues.dayOffType ||
                  !formValues.offFrom ||
                  (formValues.dayOffType === DaysOffType.MULTIPLE_DAY && !formValues.offTo) ||
                  !formValues.reason
                }
                className="gap-2 h-10 px-4"
              >
                <CheckCircle2 className="size-4" />
                {mode === 'update' ? 'Cập nhật đơn' : 'Gửi đơn xin nghỉ'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
