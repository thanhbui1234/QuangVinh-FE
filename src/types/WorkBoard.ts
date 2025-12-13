export interface IWorkBoardCell {
  rowIndex: number
  columnIndex: number
  value: string
}

export interface IWorkBoardColumn {
  id: string
  label: string
  width?: number
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
