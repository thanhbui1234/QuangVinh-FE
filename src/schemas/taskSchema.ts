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
    assigneeId: z.string().optional(),
    imageUrl: z.string().optional(),
    checkList: z.string().optional(),
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
