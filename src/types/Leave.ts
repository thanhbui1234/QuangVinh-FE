import { Briefcase, Calendar, Heart, Plane } from 'lucide-react'
import type { User } from '@/types/User.ts'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export type LeaveSession = 'FULL' | 'AM' | 'PM'

export const StatusLeaves = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
} as const

export enum DaysOffType {
  MORNING = 1,
  AFTERNOON = 2,
  ALLDAY = 3,
  MULTIPLE_DAY = 4,
}

export const mapDayOffType = {
  1: 'Buổi sáng',
  2: 'Buổi chiều',
  3: 'Cả ngày',
  4: 'Nghỉ theo ngày',
}

export type LeaveFormValues = {
  absenceType: LeavesType
  dayOffType: DaysOffType
  dayOff: number
  offFrom: string
  offTo: string
  reason: string
}

export enum LeavesType {
  SPECIAL = 1,
  YEARLY = 2,
  NO_SALARY = 3,
  SICK = 4,
}

export const MappingLeavesType = {
  1: 'Đặc biệt (Tham gia sự kiện) ',
  2: 'Phép hàng năm',
  3: 'Không lương',
  4: 'Ốm',
}

export type LeavesStatus = (typeof StatusLeaves)[keyof typeof StatusLeaves]

export type LeavesListDataResponse = {
  id: number
  creator: User
  approver: User
  reason: string
  status: LeavesStatus
  dayOff: number
  absenceType: LeavesType
  dayOffType: DaysOffType
  offFrom: string
  offTo: string
  createdTime: string
  updatedTime: string
}

export type LeavesListResponse = {
  statuses: LeavesStatus[]
  creatorIds: string[]
  offset: number
  limit: number
  absenceRequests: LeavesListDataResponse[]
}

export type GetListLeavesParams = {
  statuses: LeavesStatus[]
  creatorIds?: number[]
  offset: number
  limit: number
}

export const getLeaveIcon = (type: LeavesType) => {
  const icons = {
    2: Plane,
    4: Heart,
    3: Briefcase,
    1: Calendar,
  }
  return icons[type] || Calendar
}
