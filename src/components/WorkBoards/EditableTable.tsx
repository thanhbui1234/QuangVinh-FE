import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Settings2, RefreshCw, Settings, BarChart3 } from 'lucide-react'
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

interface EditableTableProps {
  workBoard: IWorkBoard | null
  sheetId?: number
  onSave: (data: {
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
    columnChanges?: {
      added: IWorkBoardColumn[]
      modified: Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>
      deleted: IWorkBoardColumn[]
    }
  }) => void
  isSaving?: boolean
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
  onDeleteRow?: (rowIndex: number) => void
  onRefresh?: () => void
  isFetching?: boolean
}

export const EditableTable: React.FC<EditableTableProps> = ({
  workBoard,
  sheetId,
  onSave,
  isSaving = false,
  isFetching = false,
  onUnsavedChangesChange,
  onDeleteRow,
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
  const [statisticsColumn, setStatisticsColumn] = useState<{ name: string; index: number } | null>(
    null
  )

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

      onSave({
        rows: currentRows,
        columns: currentColumns.length,
        columnHeaders: currentColumns,
        cells: cellsArray,
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
  }, 125)

  const setCellValue = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const key = `${rowIndex}-${colIndex}`
      setCells((prev) => {
        const newMap = new Map(prev)
        if (value) {
          newMap.set(key, value)
        } else {
          newMap.delete(key)
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
      setCellValue(editingCell.row, editingCell.col, editingValue)
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
      setRows(workBoard.rows)
      setColumns(workBoard.columns)
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
  }, [workBoard, columns])

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
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button onClick={handleAddRow} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Thêm hàng
          </Button>
          <Button onClick={() => setShowColumnManager(true)} variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-1" />
            Quản lý cột
          </Button>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Tải lại
          </Button>
          <Button onClick={() => setShowSetting(true)} variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{isSaving ? 'Đang lưu...' : 'Đã lưu'}</div>
      </div>

      {/* Table */}
      {/* Table Content */}
      <Card className="overflow-hidden">
        {isFetching ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Đang tải bảng công việc...</p>
            </div>
          </div>
        ) : columnHeaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Settings2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Chưa có cột nào được hiển thị
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Bảng hiện tại chưa có cột nào. Vui lòng thêm cột để bắt đầu nhập dữ liệu.
            </p>
            <Button onClick={() => setShowColumnManager(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm cột ngay
            </Button>
          </div>
        ) : (
          <div
            ref={tableRef}
            className="relative w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]"
            style={{ width: '100%' }}
          >
            <table
              className="caption-bottom text-sm"
              style={{ minWidth: 'max-content', width: '100%' }}
            >
              <TableHeader className="sticky top-0 z-10 bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 bg-muted/50 sticky left-0 z-20 border-r">
                    <div className="flex items-center justify-between group">
                      <span className="text-muted-foreground">#</span>
                    </div>
                  </TableHead>
                  {columnHeaders.map((col, colIndex) => {
                    const columnColor = col.color || '#FFFFFF'
                    return (
                      <React.Fragment key={col.id}>
                        <TableHead
                          className="min-w-[150px] whitespace-nowrap relative group/col"
                          style={{
                            borderTop: `3px solid ${columnColor}`,
                            backgroundColor: columnColor,
                          }}
                        >
                          {editingCell?.row === -1 && editingCell?.col === colIndex ? (
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
                              className="h-8 text-gray-900 dark:text-gray-900"
                            />
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-2 flex-1">
                                <div
                                  className="w-3 h-3 rounded-sm border border-border"
                                  style={{ backgroundColor: columnColor }}
                                  title={`Màu: ${columnColor}`}
                                />
                                <span
                                  className="flex-1 cursor-pointer hover:text-blue-600 transition-colors font-semibold text-gray-900 dark:text-gray-900"
                                  onClick={() => {
                                    setEditingCell({ row: -1, col: colIndex })
                                    setEditingValue(col.label)
                                  }}
                                >
                                  {col.label}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setStatisticsColumn({
                                    name: col.name || col.label,
                                    index: colIndex,
                                  })
                                }}
                                title="Thống kê cột"
                              >
                                <BarChart3 className="h-3 w-3 text-gray-900 dark:text-gray-900" />
                              </Button>
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
                  <TableRow key={rowIndex} className={cn(rowIndex % 2 === 1 && 'bg-muted/50')}>
                    <TableCell className="bg-muted/50 sticky left-0 z-10 border-r relative group/row">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">{rowIndex + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
                          onClick={() => {
                            setOpenConfirm(true)
                            setRowIndex(rowIndex)
                          }}
                          title="Xóa hàng"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      {/* Add row button after each row */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -bottom-3 left-0 right-0 h-6 w-full p-0 opacity-0 group-hover/row:opacity-100 hover:opacity-100 z-30 bg-background border border-t-0 rounded-b-md"
                        onClick={() => {
                          handleAddRow()
                          // Shift cells down
                          setTimeout(() => {
                            setCells((prev) => {
                              const newMap = new Map()
                              prev.forEach((value, key) => {
                                const [r, c] = key.split('-').map(Number)
                                if (r > rowIndex) {
                                  newMap.set(`${r + 1}-${c}`, value)
                                } else {
                                  newMap.set(key, value)
                                }
                              })
                              return newMap
                            })
                          }, 0)
                        }}
                        title="Thêm hàng sau"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    {Array.from({ length: columns }).map((_, colIndex) => {
                      const isEditing =
                        editingCell?.row === rowIndex && editingCell?.col === colIndex
                      const cellValue = getCellValue(rowIndex, colIndex)
                      const column = columnHeaders[colIndex]
                      const hasOptions = column?.options && column.options.length > 0
                      const columnType = column?.type || 'text'
                      const columnColor = column?.color || '#FFFFFF'

                      return (
                        <TableCell
                          key={colIndex}
                          className={cn(
                            'min-w-[150px] p-0 whitespace-nowrap',
                            isEditing && 'bg-primary/10'
                          )}
                          style={{ backgroundColor: columnColor }}
                        >
                          {columnType === 'select' && hasOptions ? (
                            <Select
                              value={cellValue || undefined}
                              onValueChange={(value) => {
                                setCellValue(rowIndex, colIndex, value)
                              }}
                            >
                              <SelectTrigger className="border-0 focus:ring-0 h-full rounded-none shadow-none min-h-[40px] text-gray-900 dark:text-gray-900">
                                <SelectValue placeholder="Chọn giá trị..." />
                              </SelectTrigger>
                              <SelectContent>
                                {column.options?.map((option, idx) => (
                                  <SelectItem key={idx} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : isEditing ? (
                            <Input
                              ref={inputRef}
                              type={columnType === 'number' ? 'number' : 'text'}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="border-0 focus-visible:ring-0 h-full rounded-none text-gray-900 dark:text-gray-900"
                            />
                          ) : (
                            <div
                              className="p-2 min-h-[40px] cursor-pointer hover:bg-muted/50 transition-colors text-gray-900 dark:text-gray-900"
                              onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                              {cellValue || (
                                <span className="text-gray-500 text-sm">Nhấp để chỉnh sửa</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
                {/* Add row button at the end */}
                <TableRow>
                  <TableCell className="bg-muted/50 sticky left-0 z-10 border-r">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full p-0 hover:bg-muted/50"
                      onClick={handleAddRow}
                      title="Thêm hàng"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="min-w-[150px] p-0" />
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
      <SettingWorkBoards open={showSetting} onOpenChange={setShowSetting as any} />
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
