import dayjs from 'dayjs'
import type { LeavesListDataResponse } from '@/types/Leave.ts'

/**
 * Get all dates in a date range (inclusive)
 */
export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = []
  let current = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).startOf('day')

  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.toDate())
    current = current.add(1, 'day')
  }

  return dates
}

/**
 * Check if a date is within a leave request range
 */
export const isDateInLeaveRange = (date: Date, leave: LeavesListDataResponse): boolean => {
  // Use startOf('day') to ensure we're comparing dates correctly
  const dateDay = dayjs(date).startOf('day')
  const offFromDay = dayjs(leave.offFrom).startOf('day')
  const offToDay = dayjs(leave.offTo).startOf('day')

  // Check if the date is between offFrom and offTo (inclusive)
  return (
    (dateDay.isSame(offFromDay) || dateDay.isAfter(offFromDay)) &&
    (dateDay.isSame(offToDay) || dateDay.isBefore(offToDay))
  )
}

/**
 * Get all dates that have leave requests
 */
export const getLeaveDates = (
  weekStart: Date,
  weekEnd: Date,
  leaves: LeavesListDataResponse[]
): Set<string> => {
  const leaveDates = new Set<string>()
  const weekDates = getDatesInRange(weekStart, weekEnd)

  weekDates.forEach((date) => {
    const hasLeave = leaves.some((leave) => {
      const isInRange = isDateInLeaveRange(date, leave)
      return isInRange
    })
    if (hasLeave) {
      leaveDates.add(dayjs(date).format('YYYY-MM-DD'))
    }
  })

  return leaveDates
}

/**
 * Get week days (Monday to Sunday)
 */
export const getWeekDays = (
  weekStart: Date
): Array<{ date: Date; label: string; dayOfWeek: string }> => {
  const days: Array<{ date: Date; label: string; dayOfWeek: string }> = []
  const start = dayjs(weekStart).startOf('day')

  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  for (let i = 0; i < 7; i++) {
    const date = start.add(i, 'day').toDate()
    days.push({
      date,
      label: dayjs(date).format('DD/MM'),
      dayOfWeek: dayLabels[i],
    })
  }

  return days
}

/**
 * Format week range label
 */
export const formatWeekRangeLabel = (weekStart: Date, weekEnd: Date): string => {
  const start = dayjs(weekStart).format('DD/MM/YYYY')
  const end = dayjs(weekEnd).format('DD/MM/YYYY')
  return `${start} - ${end}`
}
