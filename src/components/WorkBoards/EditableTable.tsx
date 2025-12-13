import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { IWorkBoard, IWorkBoardCell, IWorkBoardColumn } from '@/types/WorkBoard'

interface EditableTableProps {
  workBoard: IWorkBoard | null
  onSave: (data: {
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
  }) => void
  isSaving?: boolean
}

export const EditableTable: React.FC<EditableTableProps> = ({
  workBoard,
  onSave,
  isSaving = false,
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

  // Initialize cells from workBoard
  useEffect(() => {
    if (workBoard) {
      setRows(workBoard.rows)
      setColumns(workBoard.columns)
      setColumnHeaders(workBoard.columnHeaders || [])

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
    setRows((prev) => prev + 1)
  }

  const handleDeleteRow = (rowIndex: number) => {
    if (rows > 1) {
      setRows((prev) => prev - 1)
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

  const handleAddColumn = () => {
    setColumns((prev) => prev + 1)
    const newColumn: IWorkBoardColumn = {
      id: `col-${columns}`,
      label: `Cột ${columns + 1}`,
      width: 150,
    }
    setColumnHeaders((prev) => [...prev, newColumn])
  }

  const handleDeleteColumn = (colIndex: number) => {
    if (columns > 1) {
      setColumns((prev) => prev - 1)
      setColumnHeaders((prev) => prev.filter((_, i) => i !== colIndex))
      // Remove cells in deleted column
      setCells((prev) => {
        const newMap = new Map()
        prev.forEach((value, key) => {
          const [r, c] = key.split('-').map(Number)
          if (c < colIndex) {
            newMap.set(key, value)
          } else if (c > colIndex) {
            // Shift column indices left
            newMap.set(`${r}-${c - 1}`, value)
          }
        })
        return newMap
      })
    }
  }

  const handleColumnHeaderChange = (colIndex: number, label: string) => {
    setColumnHeaders((prev) => {
      const newHeaders = [...prev]
      newHeaders[colIndex] = { ...newHeaders[colIndex], label }
      return newHeaders
    })
  }

  const handleSave = () => {
    const cellsArray: IWorkBoardCell[] = []
    cells.forEach((value, key) => {
      const [rowIndex, columnIndex] = key.split('-').map(Number)
      cellsArray.push({ rowIndex, columnIndex, value })
    })

    onSave({
      rows,
      columns,
      columnHeaders,
      cells: cellsArray,
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
          <Button onClick={handleAddColumn} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Thêm cột
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
        >
          <table className="w-full caption-bottom text-sm" style={{ minWidth: 'max-content' }}>
            <TableHeader className="sticky top-0 z-10 bg-muted/50">
              <TableRow>
                <TableHead className="w-12 bg-muted/50 sticky left-0 z-20 border-r">
                  <div className="flex items-center justify-between group">
                    <span className="text-muted-foreground">#</span>
                  </div>
                </TableHead>
                {columnHeaders.map((col, colIndex) => (
                  <TableHead key={col.id} className="min-w-[150px] whitespace-nowrap">
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
                        <span
                          className="flex-1 cursor-pointer hover:text-primary"
                          onClick={() => {
                            setEditingCell({ row: -1, col: colIndex })
                            setEditingValue(col.label)
                          }}
                        >
                          {col.label}
                        </span>
                        {columns > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteColumn(colIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className={cn(rowIndex % 2 === 1 && 'bg-muted/50')}>
                  <TableCell className="bg-muted/50 sticky left-0 z-10 border-r">
                    <div className="flex items-center justify-between group">
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
                  </TableCell>
                  {Array.from({ length: columns }).map((_, colIndex) => {
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                    const cellValue = getCellValue(rowIndex, colIndex)

                    return (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          'min-w-[150px] p-0 whitespace-nowrap',
                          isEditing && 'bg-primary/10'
                        )}
                      >
                        {isEditing ? (
                          <Input
                            ref={inputRef}
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
            </TableBody>
          </table>
        </div>
      </Card>
    </div>
  )
}
