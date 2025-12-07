import dayjs from 'dayjs'

export const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // reset phút, giây, mili giây không cần thiết
  const diffTime = end.getTime() - start.getTime() // milliseconds

  const totalHours = Math.floor(diffTime / (1000 * 60 * 60)) // tổng số giờ
  const days = Math.floor(totalHours / 24) // số ngày
  const hours = totalHours % 24 // phần giờ còn lại

  return { days, hours }
}

export const convertToISO = (dateStr: string) => {
  return dayjs(dateStr).startOf('day').format()
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Convert timestamp (milliseconds) to formatted date string
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Convert ISO date string to YYYY-MM-DD format for input type="date"
export const convertToDateInput = (dateString: string): string => {
  if (!dateString) return ''
  return dayjs(dateString).format('YYYY-MM-DD')
}

export const formatDateRangeShort = (startTimestamp?: number, endTimestamp?: number): string => {
  if (!startTimestamp || !endTimestamp) return ''
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
  return `${formatter.format(new Date(startTimestamp))} - ${formatter.format(new Date(endTimestamp))}`
}

const DAY_OF_WEEK_SHORT_LABELS: Record<string, string> = {
  MONDAY: 'T2',
  TUESDAY: 'T3',
  WEDNESDAY: 'T4',
  THURSDAY: 'T5',
  FRIDAY: 'T6',
  SATURDAY: 'T7',
  SUNDAY: 'CN',
}

export const getDayOfWeekShortLabel = (dayOfWeek?: string): string => {
  if (!dayOfWeek) return ''
  return DAY_OF_WEEK_SHORT_LABELS[dayOfWeek.toUpperCase()] ?? dayOfWeek
}

// Calculate and format estimate hours from timestamps or direct hours input
export const getFormattedEstimate = (startTimeOrHours: number, endTime?: number): string => {
  let hours: number

  // If endTime is provided, calculate hours from timestamps
  if (endTime !== undefined) {
    if (!startTimeOrHours || !endTime) return '0 giờ'
    const diffMs = endTime - startTimeOrHours
    hours = Math.floor(diffMs / (1000 * 60 * 60))
  } else {
    // Otherwise, treat first param as hours directly
    hours = startTimeOrHours
  }

  if (!hours || hours <= 0) return '0 giờ'

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0 && remainingHours > 0) {
    return `${days} ngày ${remainingHours} giờ`
  } else if (days > 0) {
    return `${days} ngày`
  } else {
    return `${remainingHours} giờ`
  }
}

export const formatEstimateHours = (hours: number): string => {
  if (!hours || hours <= 0) return 'Quá hạn'

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0 && remainingHours > 0) {
    return `${days} ngày ${remainingHours} giờ`
  } else if (days > 0) {
    return `${days} ngày`
  } else {
    return `${remainingHours} giờ`
  }
}

// ============ DatePicker Helper Functions ============

/**
 * Parse date string to Date object
 * Handles both ISO strings and YYYY-MM-DD format
 */
export const parseDate = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined
  const parsed = dayjs(dateStr)
  return parsed.isValid() ? parsed.toDate() : undefined
}

/**
 * Format Date to YYYY-MM-DD string
 * Used for date inputs and leave forms
 */
export const formatToDateString = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * Format Date to datetime-local string (YYYY-MM-DDTHH:mm)
 * Used for datetime-local inputs in task forms
 */
export const formatToDateTimeLocal = (date: Date): string => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

/**
 * Convert timestamp to datetime-local format
 */
export const timestampToDateTimeLocal = (timestamp?: number): string => {
  if (!timestamp) return ''
  return dayjs(timestamp).format('YYYY-MM-DDTHH:mm')
}

/**
 * Get start of day timestamp (00:00:00.000)
 */
export const getStartOfDayTimestamp = (date: Date | string | number): number => {
  return dayjs(date).startOf('day').valueOf()
}

/**
 * Get end of day timestamp (23:59:59.999)
 */
export const getEndOfDayTimestamp = (date: Date | string | number): number => {
  return dayjs(date).endOf('day').valueOf()
}

/**
 * Calculate date range for a given number of days from today
 * Returns timestamps for start and end of the range
 */
export const calculateDateRange = (
  days: number,
  startFromToday = true
): { startDate: number; endDate: number } => {
  const today = dayjs().startOf('day')
  const start = startFromToday ? today : today.subtract(days - 1, 'day')
  const end = startFromToday ? today.add(days - 1, 'day') : today

  return {
    startDate: start.valueOf(),
    endDate: end.endOf('day').valueOf(),
  }
}

/**
 * Calculate week range (Monday to Sunday) with optional offset
 */
export const calculateWeekRange = (weekOffset = 0): { startDate: number; endDate: number } => {
  const now = dayjs()
  const day = now.day()
  const distanceToMonday = (day + 6) % 7

  const monday = now
    .subtract(distanceToMonday, 'day')
    .add(weekOffset * 7, 'day')
    .startOf('day')
  const sunday = monday.add(6, 'day').endOf('day')

  return {
    startDate: monday.valueOf(),
    endDate: sunday.valueOf(),
  }
}

/**
 * Get initials from a name (e.g., "Nguyễn Văn A" -> "NA")
 */
export const getInitials = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format timestamp to Vietnamese date string
 */
export const formatTimestampToDate = (timestamp: number): string => {
  if (!timestamp) return ''
  return dayjs(timestamp).format('DD/MM/YYYY')
}
