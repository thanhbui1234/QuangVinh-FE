import React from 'react'
import { Controller, type Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Repeat, Clock, Calendar } from 'lucide-react'
import type { CreateTaskFormData } from '@/schemas/taskSchema'

export const RECURRENCE_TYPE = {
  HOURLY: '1',
  DAILY: '2',
  WEEKLY: '3',
  MONTHLY: '4',
} as const

export const RECURRENCE_TYPE_LABELS = {
  [RECURRENCE_TYPE.HOURLY]: 'Theo giờ',
  [RECURRENCE_TYPE.DAILY]: 'Hàng ngày',
  [RECURRENCE_TYPE.WEEKLY]: 'Hàng tuần',
  [RECURRENCE_TYPE.MONTHLY]: 'Hàng tháng',
}

export const DAY_OF_WEEK_LABELS = {
  '1': 'Thứ 2',
  '2': 'Thứ 3',
  '3': 'Thứ 4',
  '4': 'Thứ 5',
  '5': 'Thứ 6',
  '6': 'Thứ 7',
  '7': 'Chủ nhật',
}

interface RecurrenceSettingsProps {
  control: Control<CreateTaskFormData>
  watch: (name: keyof CreateTaskFormData) => any
  errors: any
}

export const RecurrenceSettings: React.FC<RecurrenceSettingsProps> = ({
  control,
  watch,
  errors,
}) => {
  const isRecurrenceEnabled = watch('isRecurrenceEnabled')
  const recurrenceType = watch('recurrenceType')

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Enable Recurrence Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-gray-600" />
          <Label htmlFor="isRecurrenceEnabled" className="text-sm font-medium text-gray-700">
            Lặp lại tự động
          </Label>
        </div>
        <Controller
          name="isRecurrenceEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              id="isRecurrenceEnabled"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {isRecurrenceEnabled && (
        <>
          {/* Recurrence Type */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceType" className="text-sm font-medium text-gray-700">
              Loại lặp lại <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="recurrenceType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="recurrenceType" className="w-full bg-white">
                    <SelectValue placeholder="Chọn loại lặp lại" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECURRENCE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.recurrenceType && (
              <p className="text-sm text-red-500">{errors.recurrenceType.message}</p>
            )}
          </div>

          {/* Recurrence Interval */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceInterval" className="text-sm font-medium text-gray-700">
              Khoảng thời gian lặp lại
            </Label>
            <Controller
              name="recurrenceInterval"
              control={control}
              render={({ field }) => (
                <Input
                  id="recurrenceInterval"
                  type="number"
                  min="1"
                  placeholder="Nhập số (mặc định: 1)"
                  {...field}
                  className="bg-white"
                />
              )}
            />
            <p className="text-xs text-gray-500">
              {recurrenceType === RECURRENCE_TYPE.HOURLY && 'Ví dụ: 2 = lặp lại mỗi 2 giờ'}
              {recurrenceType === RECURRENCE_TYPE.DAILY && 'Ví dụ: 1 = lặp lại mỗi ngày'}
              {recurrenceType === RECURRENCE_TYPE.WEEKLY && 'Ví dụ: 1 = lặp lại mỗi tuần'}
              {recurrenceType === RECURRENCE_TYPE.MONTHLY && 'Ví dụ: 1 = lặp lại mỗi tháng'}
            </p>
          </div>

          {/* Hour of Day (for DAILY, WEEKLY, MONTHLY) */}
          {recurrenceType && recurrenceType !== RECURRENCE_TYPE.HOURLY && (
            <div className="space-y-2">
              <Label
                htmlFor="hourOfDay"
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                Giờ trong ngày (0-23)
              </Label>
              <Controller
                name="hourOfDay"
                control={control}
                render={({ field }) => (
                  <Input
                    id="hourOfDay"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="Ví dụ: 9 (9h sáng)"
                    {...field}
                    className="bg-white"
                  />
                )}
              />
              <p className="text-xs text-gray-500">Để trống nếu không cần chỉ định giờ cụ thể</p>
            </div>
          )}

          {/* Day of Week (for WEEKLY) */}
          {recurrenceType === RECURRENCE_TYPE.WEEKLY && (
            <div className="space-y-2">
              <Label
                htmlFor="dayOfWeek"
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Ngày trong tuần
              </Label>
              <Controller
                name="dayOfWeek"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dayOfWeek" className="w-full bg-white">
                      <SelectValue placeholder="Chọn ngày trong tuần" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Day of Month (for MONTHLY) */}
          {recurrenceType === RECURRENCE_TYPE.MONTHLY && (
            <div className="space-y-2">
              <Label
                htmlFor="dayOfMonth"
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Ngày trong tháng (1-31)
              </Label>
              <Controller
                name="dayOfMonth"
                control={control}
                render={({ field }) => (
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ví dụ: 15 (ngày 15 hàng tháng)"
                    {...field}
                    className="bg-white"
                  />
                )}
              />
            </div>
          )}

          {/* Helpful Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Lưu ý:</strong> Task template sẽ tự động tạo các task mới theo lịch đã cấu
              hình. Hệ thống sẽ tính toán thời gian thực thi tiếp theo dựa trên các thông số trên.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
