import { z } from 'zod'

// Schema for CreateTaskModal form (before API transformation)
export const CreateTaskFormSchema = z
  .object({
    description: z.string().min(1, 'Tên công việc là bắt buộc'),
    priority: z.string().min(1),
    taskType: z.string().min(1),
    status: z.string().min(1),
    startDate: z.string().optional(),
    estimateDate: z.string().min(1, 'Thời gian hoàn thành là bắt buộc'),
    assigneeIds: z.array(z.string()).optional(),
    supervisor: z.string().optional(),
    imageUrls: z.array(z.string().url()),
    checkList: z.string().optional(),
    // Recurrence fields
    isRecurrenceEnabled: z.preprocess((val) => val ?? false, z.boolean()),
    recurrenceType: z.string().optional(), // 1=HOURLY, 2=DAILY, 3=WEEKLY, 4=MONTHLY
    recurrenceInterval: z.string().optional(),
    hourOfDay: z.string().optional(), // 0-23
    dayOfWeek: z.string().optional(), // 1=Monday, 7=Sunday
    dayOfMonth: z.string().optional(), // 1-31
  })
  .refine(
    (data) => {
      // If no startDate, validation passes
      if (!data.startDate || !data.estimateDate) return true

      // Compare datetime strings
      const startTime = new Date(data.startDate).getTime()
      const endTime = new Date(data.estimateDate).getTime()
      return endTime >= startTime
    },
    {
      message: 'Thời gian hoàn thành phải sau hoặc bằng thời gian bắt đầu',
      path: ['estimateDate'],
    }
  )
  .refine(
    (data) => {
      // If recurrence is disabled, no validation needed
      if (!data.isRecurrenceEnabled) return true
      // If recurrence is enabled, recurrenceType is required
      return !!data.recurrenceType
    },
    {
      message: 'Vui lòng chọn loại lặp lại',
      path: ['recurrenceType'],
    }
  )

export type CreateTaskFormData = z.infer<typeof CreateTaskFormSchema>

// Original schema for API payload (keep for backwards compatibility)
export const CreateTaskSchema = z
  .object({
    description: z.string().min(1, 'Mô tả không được để trống'),
    priority: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)], {
      message: 'Priority phải từ 0-4',
    }),
    taskType: z.number().int().positive(),
    groupId: z.number().int().positive(),

    assignee: z.object({
      id: z.number().int().positive('Assignee ID bắt buộc'),
    }),

    status: z.number().int().optional(),
    checkList: z.string().optional(),
    imageUrls: z.array(z.string().url()).default([]),
    startTime: z.number().optional(),
    estimateTime: z.number().optional(),
    doneTime: z.number().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.estimateTime) return true
      return data.estimateTime >= data.startTime
    },
    {
      message: 'Estimate time phải lớn hơn hoặc bằng Start time',
      path: ['estimateTime'],
    }
  )

export const scoreSchema = z.object({
  progressScore: z.coerce
    .number()
    .refine((val) => !Number.isNaN(val), {
      message: 'Chỉ được nhập số',
    })
    .min(1, { message: 'Số phải từ 1 đến 10' })
    .max(10, { message: 'Số phải từ 1 đến 10' }),
})
