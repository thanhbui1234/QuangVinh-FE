export interface IWorkBoardCell {
  rowIndex: number
  columnIndex: number
  value: string
}

export interface IWorkBoardColumn {
  id: string
  label: string
  width?: number
  // Full column properties from API
  name?: string // Original column name from API
  type?: string // Column type (text, number, etc.)
  index?: number // Column index
  color?: string // Column color
  required?: boolean // Is column required
  options?: string[] // Options for select/dropdown types
}

export interface IWorkBoard {
  id: number
  name: string
  description?: string
  rows: number
  columns: number
  columnHeaders: IWorkBoardColumn[]
  cells: IWorkBoardCell[]
  createdAt?: string
  updatedAt?: string
}

export interface ICreateWorkBoard {
  name: string
  description?: string
  rows: number
  columns: number
  columnHeaders: IWorkBoardColumn[]
  cells: IWorkBoardCell[]
}

export interface IUpdateWorkBoard {
  id: number
  name?: string
  description?: string
  rows?: number
  columns?: number
  columnHeaders?: IWorkBoardColumn[]
  cells?: IWorkBoardCell[]
}

// API Response Types
export interface ISheetColumn {
  name: string
  type: string
  index: number
  color: string
  required: boolean
  options: string[]
}

export interface ISheetRow {
  id: number
  sheetId: number
  rowData: Record<string, string>
  color: string
  status: number
  createdTime: number
  updatedTime: number
}

export interface ISheetInfo {
  id: number
  sheetName: string
  sheetType: number
  columns: ISheetColumn[]
  rows: ISheetRow[]
  creatorId: number
  viewableUserIds: number[]
  editableUserIds: number[]
  createdTime: number
  updatedTime: number
}

export interface IGetSheetDetailRequest {
  sheetId: number
  rowSize: number
}

export interface IGetSheetDetailResponse {
  sheetId: number
  rowSize: number
  sheetInfo: ISheetInfo
}

// Column API Types
export interface IAddColumnRequest {
  sheetId: number
  name: string
  type: string
  index: number
  color: string
  required: boolean
  options: string[]
}

export interface IAddColumnResponse {
  sheetId: number
  name: string
  type: string
  index: number
  color: string
  required: boolean
  options: string[]
  result: boolean
}

export interface IUpdateColumnRequest {
  sheetId: number
  columnName: string
  newColumnName?: string
  newIndex?: number
  newColor?: string
  newRequired?: boolean
  newOptions?: string[]
}

export interface IUpdateColumnResponse {
  sheetId: number
  columnName: string
  newColumnName?: string
  newIndex?: number
  newColor?: string
  newRequired?: boolean
  newOptions?: string[]
  result: boolean
}

export interface IRemoveColumnRequest {
  sheetId: number
  columnName: string
}

export interface IRemoveColumnResponse {
  sheetId: number
  columnName: string
  result: boolean
}
