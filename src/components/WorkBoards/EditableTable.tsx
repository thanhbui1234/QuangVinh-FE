import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Save, Settings2 } from 'lucide-react'
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

interface EditableTableProps {
  workBoard: IWorkBoard | null
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
}

export const EditableTable: React.FC<EditableTableProps> = ({
  workBoard,
  onSave,
  isSaving = false,
  onUnsavedChangesChange,
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

  // Initialize cells from workBoard
  useEffect(() => {
    if (workBoard) {
      setRows(workBoard.rows)
      setColumns(workBoard.columns)
      const headers = workBoard.columnHeaders || []
      setColumnHeaders(headers)
      // Store original columns for comparison
      setOriginalColumns(headers.map((col) => ({ ...col })))

      const cellsMap = new Map<string, string>()
      workBoard.cells?.forEach((cell) => {
        const key = `${cell.rowIndex}-${cell.columnIndex}`
        cellsMap.set(key, cell.value)
      })
      setCells(cellsMap)
    } else {
      // Initialize with default columns
      const defaultColumns: IWorkBoardColumn[] = Array.from({ length: columns }, (_, i) => ({
        id: `col-${i}`,
        label: `Cột ${i + 1}`,
        width: 150,
      }))
      setColumnHeaders(defaultColumns)
      setOriginalColumns([])
    }
  }, [workBoard])

  // Update columns when columns count changes (only for new boards)
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

  const getCellValue = useCallback(
    (rowIndex: number, colIndex: number): string => {
      const key = `${rowIndex}-${colIndex}`
      return cells.get(key) || ''
    },
    [cells]
  )

  const setCellValue = useCallback((rowIndex: number, colIndex: number, value: string) => {
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
  }, [])

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
    if (e.key === 'Enter') {
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

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleAddRow = () => {
    setRows((prev: any) => prev + 1)

    // Initialize empty cells for all columns in the new row
    // This makes it clear to users that they can edit all cells
    setCells((prev) => {
      const newMap = new Map(prev)
      // We don't actually set empty values, just increment the row count
      // The cells will show "Nhấp để chỉnh sửa" placeholder automatically
      return newMap
    })
  }

  const handleDeleteRow = (rowIndex: number) => {
    if (rows > 1) {
      setRows((prev: any) => prev - 1)
      // Remove cells in deleted row
      setCells((prev) => {
        const newMap = new Map()
        prev.forEach((value, key) => {
          const [r] = key.split('-').map(Number)
          if (r < rowIndex) {
            newMap.set(key, value)
          } else if (r > rowIndex) {
            // Shift row indices down
            const [col] = key.split('-').map(Number)
            newMap.set(`${r - 1}-${col}`, value)
          }
        })
        return newMap
      })
    }
  }

  const handleColumnHeaderChange = (colIndex: number, label: string) => {
    setColumnHeaders((prev) => {
      const newHeaders = [...prev]
      newHeaders[colIndex] = {
        ...newHeaders[colIndex],
        label,
        name: label, // Also update name when label changes
      }
      return newHeaders
    })
  }

  const handleColumnsChange = (newColumns: IWorkBoardColumn[]) => {
    setColumnHeaders(newColumns)
    setColumns(newColumns.length)
  }

  // Check for unsaved changes
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
        col.id?.startsWith('col-new-') ||
        !originalColumns.find((oc) => (oc.name || oc.label) === colName)
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
      const originalName = originalCol.name || originalCol.label
      return !columnHeaders.find((col) => (col.name || col.label) === originalName)
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

  // Notify parent about unsaved changes
  useEffect(() => {
    if (onUnsavedChangesChange) {
      const hasChanges = checkUnsavedChanges()
      onUnsavedChangesChange(hasChanges)
    }
  }, [checkUnsavedChanges, onUnsavedChangesChange])

  const handleSave = () => {
    // First, check if there are any changes at all
    const hasAnyChanges = checkUnsavedChanges()

    if (!hasAnyChanges) {
      return
    }

    const cellsArray: IWorkBoardCell[] = []
    cells.forEach((value, key) => {
      const [rowIndex, columnIndex] = key.split('-').map(Number)
      cellsArray.push({ rowIndex, columnIndex, value })
    })

    // Calculate column changes
    const columnChanges = {
      added: [] as IWorkBoardColumn[],
      modified: [] as Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>,
      deleted: [] as IWorkBoardColumn[],
    }

    if (workBoard && originalColumns.length > 0) {
      // Find added columns (new columns without original name)
      columnHeaders.forEach((col) => {
        const colName = col.name || col.label
        const isNew =
          col.id?.startsWith('col-new-') ||
          !originalColumns.find((oc) => (oc.name || oc.label) === colName)
        if (isNew) {
          columnChanges.added.push(col)
        }
      })

      // Find modified and deleted columns
      originalColumns.forEach((originalCol) => {
        const originalName = originalCol.name || originalCol.label
        const currentCol = columnHeaders.find((col) => (col.name || col.label) === originalName)
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

    // Check for cell changes
    const originalCellsMap = new Map<string, string>()
    if (workBoard) {
      workBoard.cells?.forEach((cell) => {
        const key = `${cell.rowIndex}-${cell.columnIndex}`
        originalCellsMap.set(key, cell.value)
      })
    }

    onSave({
      rows,
      columns,
      columnHeaders,
      cells: cellsArray,
      columnChanges:
        columnChanges.added.length > 0 ||
        columnChanges.modified.length > 0 ||
        columnChanges.deleted.length > 0
          ? columnChanges
          : undefined,
    })
  }

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
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
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
                            className="h-8"
                          />
                        ) : (
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="w-3 h-3 rounded-sm border border-gray-300"
                                style={{ backgroundColor: columnColor }}
                                title={`Màu: ${columnColor}`}
                              />
                              <span
                                className="flex-1 cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setEditingCell({ row: -1, col: colIndex })
                                  setEditingValue(col.label)
                                }}
                              >
                                {col.label}
                              </span>
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
                <TableRow key={rowIndex} className={cn(rowIndex % 2 === 1 && 'bg-muted/50')}>
                  <TableCell className="bg-muted/50 sticky left-0 z-10 border-r relative group/row">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">{rowIndex + 1}</span>
                      {rows > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteRow(rowIndex)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
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
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
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
                            <SelectTrigger className="border-0 focus:ring-0 h-full rounded-none shadow-none min-h-[40px]">
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
                            className="border-0 focus-visible:ring-0 h-full rounded-none"
                          />
                        ) : (
                          <div
                            className="p-2 min-h-[40px] cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                          >
                            {cellValue || (
                              <span className="text-muted-foreground text-sm">
                                Nhấp để chỉnh sửa
                              </span>
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
      </Card>

      <ColumnManager
        open={showColumnManager}
        onOpenChange={setShowColumnManager}
        columns={columnHeaders}
        onColumnsChange={handleColumnsChange}
      />
    </div>
  )
}
