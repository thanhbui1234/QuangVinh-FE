export type SheetColumnType = 'text' | 'number' | 'select'

export interface SheetColumn {
  name: string
  type: SheetColumnType
  index: number
  color: string
  required: boolean
  options: string[]
}

export interface CreateSheetPayload {
  sheetName: string
  sheetType: number
  columns: SheetColumn[]
  viewableUserIds: number[]
  editableUserIds: number[]
}

export interface SnapshotSheet {
  id: number
  sheetName: string
  creatorId: number | null
  sheetType: number
  columns: SheetColumn[]
  viewableUserIds: number[]
  editableUserIds: number[]
  viewableUsers: any[]
  editableUsers: any[]
  createdTime: number
  updatedTime: number
}

export interface GetSnapshotSheetListRequest {
  fromId?: number
  size: number
  textSearch: string
}

export interface GetSnapshotSheetListResponse {
  fromId: number
  size: number
  textSearch: string
  snapshotSheets: SnapshotSheet[]
}
