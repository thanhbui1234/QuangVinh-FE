import { z } from 'zod'
import { projectSchema, projectResponseSchema } from '../schemas/projectSchema'
import type { STATUS_PROJECT_TYPE } from '../constants/assignments/privacy'

// Type for creating/updating project (request payload)
export type IProject = z.infer<typeof projectSchema>

// Type for owner in API response
export type IProjectOwner = {
  id: number
  email: string
  name: string
}

// Type for full project/task group from API response
export type IProjectAssignment = z.infer<typeof projectResponseSchema>

// Type for get project list request params
export type getProjectListParams = {
  statuses: STATUS_PROJECT_TYPE[] | null
  ownerIds: number[]
  offset?: number
  limit: number
}
