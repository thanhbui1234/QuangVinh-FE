import { z } from 'zod'

// Schema for creating/updating a project (request payload)
export const projectSchema = z.object({
  taskGroupId: z.number().optional(),
  name: z.string().min(1, { message: 'Tên dự án không được để trống' }).trim(),
  status: z.number().int(),
  privacy: z.number().int(),
})

// Schema for owner object in API response
const ownerSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
})

// Schema for full project/task group from API response
export const projectResponseSchema = z.object({
  taskGroupId: z.number(),
  name: z.string(),
  status: z.number(),
  privacy: z.number(),
  createdTime: z.number(),
  updatedTime: z.number(),
  owner: ownerSchema,
  members: z.array(z.any()), // Can be typed more specifically if needed
  memberIds: z.array(z.number()),
  tasks: z.array(z.any()), // Can be typed more specifically if needed
  taskIds: z.array(z.number()),
})
