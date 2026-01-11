import type { GroupStatistics, NumberStatistics } from '@/types/ColumnStatistics'

export const calculateGroupStatistics = (values: string[]): GroupStatistics => {
  const groups: Record<string, number> = {}

  values.forEach((val) => {
    // Treat empty string or null/undefined as '(Trống)' or similar if needed,
    // but the API likely just counts the raw values.
    // Let's trim and count.
    const key = val === null || val === undefined ? '' : String(val)
    // If we want to skip truly empty values from the chart entirely, we can.
    // But usually "Empty" is a valid category in group stats.
    // For now, let's just count everything.
    groups[key] = (groups[key] || 0) + 1
  })

  return {
    groups,
    type: 'group',
  }
}

export const calculateNumberStatistics = (values: string[]): NumberStatistics => {
  const numbers = values.map((v) => parseFloat(v)).filter((n) => !isNaN(n))

  const count = numbers.length

  if (count === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      sum: 0,
      type: 'number',
    }
  }

  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const sum = numbers.reduce((a, b) => a + b, 0)
  const avg = sum / count

  return {
    count,
    min,
    max,
    avg,
    sum,
    type: 'number',
  }
}
