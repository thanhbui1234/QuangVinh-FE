export interface GroupStatistics {
  groups: Record<string, number>
  type: 'group'
}

export interface NumberStatistics {
  count: number
  min: number
  max: number
  avg: number
  sum: number
  type: 'number'
}

export interface ColumnStatisticsResponse {
  sheetId: number
  columnName: string
  template: GroupStatistics | NumberStatistics
}
