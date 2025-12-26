import { Controller, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import BottomSheet from '@/components/ui/bottom-sheet.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Briefcase, Calendar, CalendarRange, Heart, Plane, Sun, Sunset } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DaysOffType, LeavesType, type LeaveFormValues } from '@/types/Leave.ts'
import { Label } from '@radix-ui/react-label'
import { useCreateLeaves } from '@/hooks/leaves/useCreateLeaves.ts'
import { useUpdateLeaves } from '@/hooks/leaves/useUpdateLeaves.ts'
import { convertToISO } from '@/utils/CommonUtils.ts'
import { useEffect } from 'react'
import { DatePicker } from '@/components/ui/datePicker'
import { parseDate, formatToDateString } from '@/utils/CommonUtils'

type CreateLeaveSheetMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'update'
  leaveId?: number
  initialValues?: Partial<LeaveFormValues> | null
  onSuccess?: () => void
}

export default function CreateLeaveSheetMobile({
  open,
  onOpenChange,
  mode = 'create',
  leaveId,
  initialValues,
  onSuccess,
}: CreateLeaveSheetMobileProps) {
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
      let dayOff: number
      if (value.dayOffType === DaysOffType.ALLDAY) {
        dayOff = 1
      } else {
        const offFromDate = new Date(value.offFrom)
        const offToDate = new Date(value.offTo || value.offFrom)
        const diffTime = offToDate.getTime() - offFromDate.getTime()
        dayOff = value.offTo ? diffTime / (1000 * 60 * 60 * 24) + 1 || 0.5 : 0.5
      }

      const payload: LeaveFormValues = {
        ...value,
        dayOff,
        offFrom: convertToISO(value.offFrom),
        offTo: value.offTo ? convertToISO(value.offTo) : convertToISO(value.offFrom),
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
  }

  const formValues = watch()

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'update' ? 'Cập nhật đơn xin nghỉ' : 'Tạo đơn xin nghỉ'}
      description={
        mode === 'update'
          ? 'Cập nhật thông tin đơn xin nghỉ'
          : 'Điền thông tin để gửi đơn xin nghỉ mới'
      }
      maxHeightClassName="max-h-[90vh]"
    >
      <form className="space-y-4 pb-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label
            htmlFor="mobile-type"
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            Loại nghỉ <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="absenceType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(Number(val) as LeavesType)}
              >
                <SelectTrigger
                  id="mobile-type"
                  className="h-12 rounded-xl border-gray-200 dark:border-gray-700"
                >
                  <SelectValue placeholder="Chọn loại nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeavesType.SPECIAL}>
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4" />
                      Đặc biệt
                    </div>
                  </SelectItem>
                  <SelectItem value={LeavesType.YEARLY}>
                    <div className="flex items-center gap-2">
                      <Plane className="size-4" />
                      Nghỉ phép năm
                    </div>
                  </SelectItem>
                  <SelectItem value={LeavesType.SICK}>
                    <div className="flex items-center gap-2">
                      <Heart className="size-4" />
                      Nghỉ ốm
                    </div>
                  </SelectItem>
                  <SelectItem value={LeavesType.NO_SALARY}>
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

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900 dark:text-white">
            Chế độ nghỉ <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="dayOffType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {leaveModeOptions.map((option) => {
                  const Icon = option.icon
                  const isActive = field.value === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      )}
                    >
                      <Icon className="size-5" />
                      <span className="text-xs font-medium">{option.label}</span>
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
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="offFrom"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-start"
                        className="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Từ ngày <span className="text-red-500">*</span>
                      </Label>
                      <DatePicker
                        value={parseDate(field.value)}
                        onChange={(date) => field.onChange(date ? formatToDateString(date) : '')}
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
                      <Label
                        htmlFor="mobile-end"
                        className="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Đến ngày <span className="text-red-500">*</span>
                      </Label>
                      <DatePicker
                        value={parseDate(field.value)}
                        onChange={(date) => field.onChange(date ? formatToDateString(date) : '')}
                        placeholder="Chọn ngày kết thúc"
                        disablePast={true}
                      />
                    </div>
                  )}
                />
              </div>
            ) : (
              <Controller
                name="offFrom"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="mobile-date"
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Ngày nghỉ <span className="text-red-500">*</span>
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

        {/* Reason */}
        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="mobile-reason"
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                Lý do <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="mobile-reason"
                placeholder="Nhập lý do xin nghỉ..."
                {...field}
                rows={4}
                className="resize-none rounded-xl border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        />

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            variant="outline"
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
            className="flex-1 h-12 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {mode === 'update' ? 'Cập nhật đơn' : 'Gửi đơn'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
