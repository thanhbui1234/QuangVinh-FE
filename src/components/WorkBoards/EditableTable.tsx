import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Settings2, RefreshCw, BarChart3 } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColumnManager } from './ColumnManager'
import { type IWorkBoard, type IWorkBoardCell, type IWorkBoardColumn } from '@/types/WorkBoard'
import { DialogConfirm } from '../ui/alertComponent'
import { SettingWorkBoards } from './SettingWorkBoards'
import { ColumnStatisticsModal } from './ColumnStatisticsModal'
import SonnerToaster from '@/components/ui/toaster'

interface EditableTableProps {
  workBoard: IWorkBoard | null
  sheetId?: number
  onSave: (data: {
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
    cellChanges?: IWorkBoardCell[]
    columnChanges?: {
      added: IWorkBoardColumn[]
      modified: Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>
      deleted: IWorkBoardColumn[]
    }
  }) => void
  isFetching?: boolean
  isInitialLoading?: boolean
  isSaving?: boolean
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
  onDeleteRow?: (rowIndex: number) => void
  onCreateRow?: () => void
  onRefresh?: () => void
}

export const EditableTable: React.FC<EditableTableProps> = ({
  workBoard,
  sheetId,
  onSave,
  isFetching = false,
  isInitialLoading = false,
  isSaving = false,
  onUnsavedChangesChange,
  onDeleteRow,
  onCreateRow,
  onRefresh,
}) => {
  const [rows, setRows] = useState(workBoard?.rows || 5)
  const [columns, setColumns] = useState(workBoard?.columns || 5)
  const [columnHeaders, setColumnHeaders] = useState<IWorkBoardColumn[]>(
    workBoard?.columnHeaders || []
  )
  const [cells, setCells] = useState<Map<string, string>>(new Map())
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const [originalColumns, setOriginalColumns] = useState<IWorkBoardColumn[]>([])
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [rowIndex, setRowIndex] = useState(-1)
  const [showSetting, setShowSetting] = useState(false)
  const [statisticsColumn, setStatisticsColumn] = useState<{
    name: string
    index: number
    type: string
    values: string[]
  } | null>(null)
  const cellChangesRef = useRef<Map<string, string>>(new Map())

  // Store state in ref for reliable access in debounced callbacks
  const stateRef = useRef({
    cells,
    columnHeaders,
    rows,
    columns,
    originalColumns,
    workBoard,
  })

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = {
      cells,
      columnHeaders,
      rows,
      columns,
      originalColumns,
      workBoard,
    }
  }, [cells, columnHeaders, rows, columns, originalColumns, workBoard])

  // Helpers
  const getCellValue = useCallback(
    (rowIndex: number, colIndex: number): string => {
      const key = `${rowIndex}-${colIndex}`
      return cells.get(key) || ''
    },
    [cells]
  )

  // Check for unsaved changes (internal check for diffing)
  const checkUnsavedChanges = useCallback(() => {
    if (!workBoard || originalColumns.length === 0) {
      // Check if cells have changed
      const hasCellChanges = cells.size > 0
      return hasCellChanges
    }

    // Check column changes
    const hasColumnChanges = columnHeaders.some((col) => {
      const colName = col.name || col.label
      const isNew =
        col.id?.startsWith('col-new-') || !originalColumns.find((oc) => oc.id === col.id)
      if (isNew) return true

      const originalCol = originalColumns.find((oc) => (oc.name || oc.label) === colName)
      if (!originalCol) return false

      return (
        (col.label || '') !== (originalCol.label || '') ||
        (col.name || '') !== (originalCol.name || '') ||
        col.index !== originalCol.index ||
        (col.color || '') !== (originalCol.color || '') ||
        col.required !== originalCol.required ||
        JSON.stringify(col.options || []) !== JSON.stringify(originalCol.options || [])
      )
    })

    // Check for deleted columns
    const hasDeletedColumns = originalColumns.some((originalCol) => {
      return !columnHeaders.find((col) => col.id === originalCol.id)
    })

    // Check cell changes
    const originalCellsMap = new Map<string, string>()
    workBoard.cells?.forEach((cell) => {
      const key = `${cell.rowIndex}-${cell.columnIndex}`
      originalCellsMap.set(key, cell.value)
    })

    const hasCellChanges =
      Array.from(cells.entries()).some(([key, value]) => {
        return originalCellsMap.get(key) !== value
      }) ||
      Array.from(originalCellsMap.entries()).some(([key, value]) => {
        return !cells.has(key) && value !== ''
      })

    return hasColumnChanges || hasDeletedColumns || hasCellChanges
  }, [workBoard, originalColumns, columnHeaders, cells])

  // Internal Save Logic
  const handleSaveInternal = useCallback(
    (
      overrideColumns?: IWorkBoardColumn[],
      overrideCells?: Map<string, string>,
      overrideRows?: number
    ) => {
      const currentCells = overrideCells || stateRef.current.cells
      const currentColumns = overrideColumns || stateRef.current.columnHeaders
      const currentRows = overrideRows !== undefined ? overrideRows : stateRef.current.rows
      const currentOriginalColumns = stateRef.current.originalColumns
      const currentWorkBoard = stateRef.current.workBoard

      // Convert cells map to array
      const cellsArray: IWorkBoardCell[] = []
      currentCells.forEach((value, key) => {
        const [rowIndex, columnIndex] = key.split('-').map(Number)
        cellsArray.push({ rowIndex, columnIndex, value })
      })

      // Calculate column changes
      const columnChanges = {
        added: [] as IWorkBoardColumn[],
        modified: [] as Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>,
        deleted: [] as IWorkBoardColumn[],
      }

      if (currentWorkBoard) {
        // Find added columns
        currentColumns.forEach((col) => {
          const isNew =
            col.id?.startsWith('col-new-') || !currentOriginalColumns.find((oc) => oc.id === col.id)
          if (isNew) {
            columnChanges.added.push(col)
          }
        })

        // Find modified and deleted columns
        currentOriginalColumns.forEach((originalCol) => {
          const currentCol = currentColumns.find((col) => col.id === originalCol.id)
          if (currentCol) {
            // Check if any property changed
            const hasChanges =
              (currentCol.label || '') !== (originalCol.label || '') ||
              (currentCol.name || '') !== (originalCol.name || '') ||
              currentCol.index !== originalCol.index ||
              (currentCol.color || '') !== (originalCol.color || '') ||
              currentCol.required !== originalCol.required ||
              JSON.stringify(currentCol.options || []) !== JSON.stringify(originalCol.options || [])
            if (hasChanges) {
              columnChanges.modified.push({ original: originalCol, updated: currentCol })
            }
          } else {
            // Column was deleted
            columnChanges.deleted.push(originalCol)
          }
        })
      }

      // Calculate cell changes
      const cellChanges: IWorkBoardCell[] = []
      cellChangesRef.current.forEach((value, key) => {
        const [rowIndex, columnIndex] = key.split('-').map(Number)
        cellChanges.push({ rowIndex, columnIndex, value })
      })

      // Clear pending changes since we're sending them
      cellChangesRef.current = new Map()

      onSave({
        rows: currentRows,
        columns: currentColumns.length,
        columnHeaders: currentColumns,
        cells: cellsArray,
        cellChanges: cellChanges.length > 0 ? cellChanges : undefined,
        columnChanges:
          columnChanges.added.length > 0 ||
          columnChanges.modified.length > 0 ||
          columnChanges.deleted.length > 0
            ? columnChanges
            : undefined,
      })
    },
    [onSave]
  )

  const debouncedSave = useDebouncedCallback(() => {
    handleSaveInternal()
  }, 500)

  const setCellValue = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const key = `${rowIndex}-${colIndex}`
      const currentValue = stateRef.current.cells.get(key) || ''

      if (currentValue === value) return

      // Track the change for the next save cycle
      cellChangesRef.current.set(key, value)

      setCells((prev) => {
        const newMap = new Map(prev)
        if (value === '') {
          newMap.delete(key)
        } else {
          newMap.set(key, value)
        }
        return newMap
      })
      // Trigger auto-save
      debouncedSave()
    },
    [debouncedSave]
  )

  // Other Handlers
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditingValue(getCellValue(rowIndex, colIndex))
  }

  const handleCellBlur = () => {
    if (editingCell) {
      const currentValue = getCellValue(editingCell.row, editingCell.col)
      if (editingValue !== currentValue) {
        setCellValue(editingCell.row, editingCell.col, editingValue)
      }
      setEditingCell(null)
    }
  }

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) {
      e.preventDefault()
      if (editingCell) {
        setCellValue(editingCell.row, editingCell.col, editingValue)
        setEditingCell(null)
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditingValue('')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (editingCell) {
        setCellValue(editingCell.row, editingCell.col, editingValue)
        const nextCol = editingCell.col + 1
        if (nextCol < columns) {
          setEditingCell({ row: editingCell.row, col: nextCol })
          setEditingValue(getCellValue(editingCell.row, nextCol))
        } else if (editingCell.row + 1 < rows) {
          setEditingCell({ row: editingCell.row + 1, col: 0 })
          setEditingValue(getCellValue(editingCell.row + 1, 0))
        } else {
          setEditingCell(null)
        }
      }
    }
  }

  const handleAddRow = () => {
    if (onCreateRow) {
      onCreateRow()
      return
    }
    setRows((prev: any) => prev + 1)
    setCells((prev) => {
      const newMap = new Map(prev)
      return newMap
    })
  }

  const handleDeleteRow = (rowIndex: number) => {
    if (onDeleteRow) {
      onDeleteRow(rowIndex)
    }

    if (rows > 0) {
      const newRowCount = rows - 1
      setRows(newRowCount)

      const newCellsMap = new Map<string, string>()
      cells.forEach((value, key) => {
        const [r] = key.split('-').map(Number)
        if (r < rowIndex) {
          newCellsMap.set(key, value)
        } else if (r > rowIndex) {
          const [col] = key.split('-').map(Number)
          newCellsMap.set(`${r - 1}-${col}`, value)
        }
      })

      setCells(newCellsMap)

      // Save immediately with new state
      handleSaveInternal(undefined, newCellsMap, newRowCount)
    }
  }

  const handleColumnHeaderChange = (colIndex: number, label: string) => {
    // Check for duplicate names
    const isDuplicate = columnHeaders.some(
      (col, idx) => idx !== colIndex && (col.name || col.label) === label
    )

    if (isDuplicate) {
      SonnerToaster({
        type: 'error',
        message: 'Trùng tên cột',
        description: `Tên cột "${label}" đã tồn tại. Vui lòng chọn tên khác.`,
      })
      return
    }

    const newHeaders = [...columnHeaders]
    newHeaders[colIndex] = {
      ...newHeaders[colIndex],
      label,
      name: label,
    }
    setColumnHeaders(newHeaders)
    // Immediate save for column changes
    handleSaveInternal(newHeaders)
  }

  const handleColumnsChange = (newColumns: IWorkBoardColumn[]) => {
    setColumnHeaders(newColumns)
    setColumns(newColumns.length)
    // Immediate save for column changes
    handleSaveInternal(newColumns)
  }

  // Effects
  useEffect(() => {
    if (workBoard) {
      // Only update if actually different to prevent unnecessary re-renders/flickers
      setRows((prev) => (prev !== workBoard.rows ? workBoard.rows : prev))
      setColumns((prev) => (prev !== workBoard.columns ? workBoard.columns : prev))

      const headers = workBoard.columnHeaders || []
      setColumnHeaders(headers)
      setOriginalColumns(headers.map((col) => ({ ...col })))

      const cellsMap = new Map<string, string>()
      workBoard.cells?.forEach((cell) => {
        const key = `${cell.rowIndex}-${cell.columnIndex}`
        cellsMap.set(key, cell.value)
      })
      setCells(cellsMap)
    } else {
      const defaultColumns: IWorkBoardColumn[] = Array.from({ length: columns }, (_, i) => ({
        id: `col-${i}`,
        label: `Cột ${i + 1}`,
        width: 150,
      }))
      setColumnHeaders(defaultColumns)
      setOriginalColumns([])
    }
  }, [workBoard])

  useEffect(() => {
    if (!workBoard && columns > 0) {
      setColumnHeaders((prev) => {
        const newColumns: IWorkBoardColumn[] = Array.from({ length: columns }, (_, i) => {
          const existing = prev[i]
          return existing || { id: `col-${i}`, label: `Cột ${i + 1}`, width: 150 }
        })
        return newColumns.slice(0, columns)
      })
    }
  }, [columns, workBoard])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Notify parent about unsaved changes (Optional: keep if purely informational, mostly for sync)
  useEffect(() => {
    if (onUnsavedChangesChange) {
      const hasChanges = checkUnsavedChanges()
      onUnsavedChangesChange(hasChanges)
    }
  }, [checkUnsavedChanges, onUnsavedChangesChange])

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 bg-muted/10 rounded-xl border border-border/20">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={handleAddRow}
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all pr-3"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm hàng
          </Button>
          <div className="h-4 w-px bg-border/40 mx-1" />
          <Button
            onClick={() => setShowColumnManager(true)}
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all pr-3"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Quản lý cột
          </Button>
          <div className="h-4 w-px bg-border/40 mx-1" />
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isFetching}
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all pr-3"
          >
            <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
            {isFetching ? 'Đang cập nhật...' : 'Làm mới'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/10 rounded-full animate-in fade-in zoom-in duration-300">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Đang lưu...
              </span>
            </div>
          )}
          {!isSaving && isFetching && !isInitialLoading && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/20 border border-border/20 rounded-full animate-in fade-in zoom-in duration-300">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-spin border-b-transparent border-t-muted-foreground/30 border-r-muted-foreground/30" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                Đang bộ bộ...
              </span>
            </div>
          )}
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
            Sẵn sàng
          </span>
        </div>
      </div>

      {/* Table Content */}
      <Card className="overflow-hidden border border-border/20 shadow-sm rounded-xl bg-card/30 backdrop-blur-sm relative">
        {isFetching && !isInitialLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 z-[60] overflow-hidden">
            <div className="h-full bg-primary w-1/3 animate-progress transition-all" />
          </div>
        )}
        {isFetching && isInitialLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 border-3 border-muted border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">
                Đang đồng bộ dữ liệu...
              </p>
            </div>
          </div>
        ) : columnHeaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center p-12">
            <div className="bg-muted p-6 rounded-3xl mb-6 shadow-inner border border-border">
              <Settings2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">Chưa có cột nào</h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm font-medium">
              Khởi tạo cấu trúc bảng bằng cách thêm các cột dữ liệu đầu tiên.
            </p>
            <Button
              onClick={() => setShowColumnManager(true)}
              className="rounded-xl h-11 px-8 shadow-sm font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thiết lập cột
            </Button>
          </div>
        ) : (
          <div
            ref={tableRef}
            className="relative w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar"
            style={{ width: '100%' }}
          >
            <table
              className="caption-bottom text-sm border-collapse"
              style={{ minWidth: 'max-content', width: '100%' }}
            >
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-16 h-10 bg-muted/20 backdrop-blur-sm sticky left-0 z-30 border-r border-border/30 font-bold text-muted-foreground/80 text-center px-0 leading-none">
                    <div className="flex items-center justify-center text-[10px] tracking-widest">
                      #
                    </div>
                  </TableHead>
                  {columnHeaders.map((col, colIndex) => {
                    const columnColor = col.color || '#FFFFFF'
                    const isDefaultColor =
                      columnColor === '#FFFFFF' || columnColor.toLowerCase() === 'transparent'

                    return (
                      <React.Fragment key={col.id}>
                        <TableHead
                          style={!isDefaultColor ? { backgroundColor: `${columnColor}50` } : {}}
                          className={cn(
                            'min-w-[200px] h-10 p-0 whitespace-nowrap border-b border-border/15 sticky top-0 z-20 bg-muted/10 dark:bg-muted/5 backdrop-blur-sm hover:bg-muted/20 transition-colors'
                          )}
                        >
                          {editingCell?.row === -1 && editingCell?.col === colIndex ? (
                            <div className="px-3">
                              <Input
                                ref={colIndex === 0 ? inputRef : undefined}
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => {
                                  handleColumnHeaderChange(colIndex, editingValue || col.label)
                                  setEditingCell(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleColumnHeaderChange(colIndex, editingValue || col.label)
                                    setEditingCell(null)
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null)
                                  }
                                }}
                                className="h-9 rounded-lg border-primary shadow-sm font-semibold text-foreground bg-background"
                              />
                            </div>
                          ) : (
                            <div
                              className="group h-full flex items-center justify-between px-4 cursor-pointer hover:bg-background/50 transition-all border-t-[3px]"
                              style={{ borderTopColor: columnColor }}
                              onClick={() => {
                                setEditingCell({ row: -1, col: colIndex })
                                setEditingValue(col.label)
                              }}
                            >
                              <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-background shadow-sm"
                                  style={{ backgroundColor: columnColor }}
                                />
                                <span className="font-bold text-foreground/80 truncate tracking-tight text-sm">
                                  {col.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {(() => {
                                  const hasData = Array.from({ length: rows }).some((_, rowIdx) => {
                                    const cellValue = getCellValue(rowIdx, colIndex)
                                    return cellValue && cellValue.trim() !== ''
                                  })

                                  if (!hasData || col.type === 'text') return null

                                  return (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-primary transition-all shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const values = Array.from({ length: rows }).map(
                                          (_, rowIdx) => getCellValue(rowIdx, colIndex)
                                        )
                                        setStatisticsColumn({
                                          name: col.name || col.label,
                                          index: colIndex,
                                          type: col.type || 'text',
                                          values,
                                        })
                                      }}
                                    >
                                      <BarChart3 className="h-3.5 w-3.5" />
                                    </Button>
                                  )
                                })()}
                              </div>
                            </div>
                          )}
                        </TableHead>
                      </React.Fragment>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="group/row hover:bg-muted/20 transition-all relative border-b border-border/20 animate-in fade-in slide-in-from-top-1 duration-300"
                  >
                    <TableCell className="w-16 h-10 bg-[#f8f8f8] dark:bg-[#151518] sticky left-0 z-10 border-r border-border/20 text-center font-bold text-muted-foreground/50 px-0 leading-none backdrop-blur-sm">
                      <div className="flex flex-col items-center justify-center relative min-h-[40px]">
                        <span className="group-hover/row:opacity-0 transition-opacity text-[10px]">
                          {rowIndex + 1}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity bg-muted/95 backdrop-blur-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={() => {
                              setOpenConfirm(true)
                              setRowIndex(rowIndex)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: columns }).map((_, colIndex) => {
                      const isEditing =
                        editingCell?.row === rowIndex && editingCell?.col === colIndex
                      const cellValue = getCellValue(rowIndex, colIndex)
                      const column = columnHeaders[colIndex]
                      const hasOptions = column?.options && column.options.length > 0
                      const columnType = column?.type || 'text'

                      const columnColor = column.color || '#FFFFFF'
                      const isDefaultColor =
                        columnColor === '#FFFFFF' || columnColor.toLowerCase() === 'transparent'

                      return (
                        <TableCell
                          key={colIndex}
                          style={!isDefaultColor ? { backgroundColor: `${columnColor}40` } : {}}
                          className={cn(
                            'min-w-[200px] p-0 whitespace-nowrap border-r border-border/10 transition-all group/cell',
                            isEditing
                              ? 'ring-1 ring-primary/40 ring-inset z-50 bg-background shadow-md shadow-primary/5'
                              : 'hover:bg-muted/15'
                          )}
                        >
                          {columnType === 'select' && hasOptions ? (
                            <Select
                              value={cellValue || undefined}
                              onValueChange={(value) => {
                                setCellValue(rowIndex, colIndex, value)
                              }}
                            >
                              <SelectTrigger className="border-0 focus:ring-0 h-10 w-full px-4 rounded-none shadow-none bg-transparent hover:bg-muted/20 transition-colors font-medium text-foreground/80">
                                <SelectValue placeholder="Chọn..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/20 shadow-2xl bg-popover/90 backdrop-blur-xl">
                                {column.options?.map((option, idx) => (
                                  <SelectItem
                                    key={idx}
                                    value={option}
                                    className="rounded-lg m-1 font-medium"
                                  >
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : isEditing ? (
                            <div className="relative h-full flex items-center px-4 bg-background z-30 shadow-inner">
                              <Input
                                ref={inputRef}
                                type={columnType === 'number' ? 'number' : 'text'}
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={handleCellBlur}
                                onKeyDown={handleCellKeyDown}
                                className="border-0 focus-visible:ring-0 h-9 w-full p-0 bg-transparent font-medium text-foreground selection:bg-primary/20"
                              />
                            </div>
                          ) : (
                            <div
                              className="px-4 h-10 flex items-center cursor-pointer transition-all font-medium text-foreground/80 relative overflow-hidden"
                              onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                              {cellValue ? (
                                <span className="truncate">{cellValue}</span>
                              ) : (
                                <span className="text-muted-foreground/80 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover/cell:opacity-100 transition-all">
                                  Trống
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                {/* Last row add button */}
                <TableRow className="border-none">
                  <TableCell className="bg-muted/10 sticky left-0 z-10 p-0 h-16">
                    <Button
                      variant="ghost"
                      className="w-full h-full rounded-none hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all flex flex-col items-center justify-center gap-1 group"
                      onClick={handleAddRow}
                    >
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Thêm mới
                      </span>
                    </Button>
                  </TableCell>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="bg-slate-50/10" />
                  ))}
                </TableRow>
              </TableBody>
            </table>
          </div>
        )}
      </Card>

      <ColumnManager
        open={showColumnManager}
        onOpenChange={setShowColumnManager}
        columns={columnHeaders}
        onColumnsChange={handleColumnsChange}
      />
      <DialogConfirm
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={() => handleDeleteRow(rowIndex)}
        title="Bạn có chắc chắn muốn xóa hàng này?"
        description="Hành động này không thể hoàn tác."
      />
      {sheetId && (
        <SettingWorkBoards
          sheetId={sheetId}
          currentName={workBoard?.name || ''}
          open={showSetting}
          onOpenChange={setShowSetting}
        />
      )}
      {sheetId && statisticsColumn && (
        <ColumnStatisticsModal
          open={!!statisticsColumn}
          onOpenChange={(open) => {
            if (!open) setStatisticsColumn(null)
          }}
          sheetId={sheetId}
          columnName={statisticsColumn.name}
        />
      )}
    </div>
  )
}
