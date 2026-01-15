import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Settings2, RefreshCw } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ColumnManager } from './ColumnManager'
import { type IWorkBoard, type IWorkBoardCell, type IWorkBoardColumn } from '@/types/WorkBoard'
import { DialogConfirm } from '../ui/alertComponent'
import { ColumnStatisticsModal } from './ColumnStatisticsModal'
import { VirtualizedTableHeader } from './VirtualizedTableHeader'
import { VirtualizedTableRow } from './VirtualizedTableRow'
import SonnerToaster from '@/components/ui/toaster'
import { useUpdateColorRow } from '@/hooks/workBoards/useUpdateColorRow'
import { useUpdateHeightRow } from '@/hooks/workBoards/useUpdateHeightRow'
import { useUpdateWidthColumn } from '@/hooks/workBoards/useUpdateWidthColumn'

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
  onDeleteRow,
  onCreateRow,
  onRefresh,
}) => {
  const [rows, setRows] = useState(workBoard?.rows || 5)
  const [columnHeaders, setColumnHeaders] = useState<IWorkBoardColumn[]>(
    workBoard?.columnHeaders || []
  )
  const [cells, setCells] = useState<Map<string, string>>(new Map())
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({})
  const [rowColors, setRowColors] = useState<Record<number, string>>({})
  const [rowIdMap, setRowIdMap] = useState<Record<number, number>>({})

  const parentRef = useRef<HTMLDivElement>(null)
  const [originalColumns, setOriginalColumns] = useState<IWorkBoardColumn[]>([])
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [rowIndexToDelete, setRowIndexToDelete] = useState(-1)
  const [statisticsColumnName, setStatisticsColumnName] = useState<string | null>(null)
  const [resizeGuide, setResizeGuide] = useState<{ type: 'col' | 'row'; pos: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cellChangesRef = useRef<Map<string, string>>(new Map())

  const handleResizeGuide = useCallback((type: 'col' | 'row' | null, clientPos: number) => {
    if (!type || !containerRef.current) {
      setResizeGuide(null)
      return
    }
    const rect = containerRef.current.getBoundingClientRect()
    const relativePos = type === 'col' ? clientPos - rect.left : clientPos - rect.top
    setResizeGuide({ type, pos: relativePos })
  }, [])

  // Initialize mutations for row/column updates
  const { updateColorRowMutation } = useUpdateColorRow({ suppressInvalidation: false, sheetId })
  const { updateHeightRowMutation } = useUpdateHeightRow({ suppressInvalidation: false, sheetId })
  const { updateWidthColumnMutation } = useUpdateWidthColumn({ suppressInvalidation: false })

  // Store state in ref for reliable access in debounced callbacks
  const stateRef = useRef({
    cells,
    columnHeaders,
    rows,
    originalColumns,
    workBoard,
  })

  useEffect(() => {
    stateRef.current = {
      cells,
      columnHeaders,
      rows,
      originalColumns,
      workBoard,
    }
  }, [cells, columnHeaders, rows, originalColumns, workBoard])

  // Virtualizer for smooth scrolling with many rows
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => rowHeights[index] || 40,
    overscan: 20,
  })

  // Helpers
  const getCellValue = useCallback(
    (rIdx: number, cIdx: number): string => {
      return cells.get(`${rIdx}-${cIdx}`) || ''
    },
    [cells]
  )

  // Debounced handler for column width resize with backend sync
  const debouncedColumnResize = useDebouncedCallback((colIndex: number, width: number) => {
    const column = columnHeaders[colIndex]
    if (!column) return

    // With the new API we send sheetId, newWidth and columnName
    updateWidthColumnMutation.mutate({
      sheetId: sheetId || workBoard?.id || 0,
      columnName: column.name || column.label,
      width,
    })
  }, 600)

  const handleColumnResize = useCallback(
    (colIndex: number, width: number) => {
      // Optimistic update
      setColumnHeaders((prev) => {
        const newHeaders = [...prev]
        newHeaders[colIndex] = { ...newHeaders[colIndex], width }
        return newHeaders
      })
      // Debounced backend sync
      debouncedColumnResize(colIndex, width)
    },
    [debouncedColumnResize]
  )

  // Debounced handler for row height resize with backend sync
  const debouncedRowResize = useDebouncedCallback((rowIndex: number, height: number) => {
    const rowId = rowIdMap[rowIndex]
    // Use strict check because rowId can be 0 and height can be 0
    if (rowId === undefined || rowId === null) return

    updateHeightRowMutation.mutate({ rowId, height })
  }, 600)

  const handleRowResize = useCallback(
    (rowIndex: number, height: number) => {
      // Optimistic update
      setRowHeights((prev) => ({ ...prev, [rowIndex]: height }))
      // Debounced backend sync
      debouncedRowResize(rowIndex, height)
    },
    [debouncedRowResize]
  )

  // Handler for row color change with immediate backend sync
  const handleRowColorChange = useCallback(
    (rowIndex: number, color: string) => {
      // Optimistic update
      setRowColors((prev) => ({ ...prev, [rowIndex]: color }))

      // Immediate backend sync for color changes
      if (!workBoard?.rowIdMap) return
      const rowId = workBoard.rowIdMap[rowIndex]
      if (!rowId) return

      updateColorRowMutation.mutate({ rowId, color })
    },
    [workBoard?.rowIdMap, updateColorRowMutation]
  )

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

      const cellsArray: IWorkBoardCell[] = []
      currentCells.forEach((value, key) => {
        const [r, c] = key.split('-').map(Number)
        cellsArray.push({ rowIndex: r, columnIndex: c, value })
      })

      const columnChanges = {
        added: [] as IWorkBoardColumn[],
        modified: [] as Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>,
        deleted: [] as IWorkBoardColumn[],
      }

      currentColumns.forEach((col) => {
        const original = currentOriginalColumns.find((oc) => oc.id === col.id)
        if (!original) {
          columnChanges.added.push(col)
        } else if (JSON.stringify(col) !== JSON.stringify(original)) {
          columnChanges.modified.push({ original, updated: col })
        }
      })

      currentOriginalColumns.forEach((oc) => {
        if (!currentColumns.find((col) => col.id === oc.id)) {
          columnChanges.deleted.push(oc)
        }
      })

      const cellChanges: IWorkBoardCell[] = []
      cellChangesRef.current.forEach((value, key) => {
        const [r, c] = key.split('-').map(Number)
        cellChanges.push({ rowIndex: r, columnIndex: c, value })
      })

      cellChangesRef.current = new Map()

      onSave({
        rows: currentRows,
        columns: currentColumns.length,
        columnHeaders: currentColumns,
        cells: cellsArray,
        cellChanges: cellChanges.length > 0 ? cellChanges : undefined,
        columnChanges:
          columnChanges.added.length ||
          columnChanges.modified.length ||
          columnChanges.deleted.length
            ? columnChanges
            : undefined,
      })
    },
    [onSave]
  )

  const debouncedSave = useDebouncedCallback(() => handleSaveInternal(), 500)

  // ... (keeping other handlers as they were, but they will use debouncedSave which relies on stateRef)

  const handleAddRow = () => {
    if (onCreateRow) {
      onCreateRow()
      return
    }
    setRows((prev) => prev + 1)
    debouncedSave()
  }

  const handleDeleteRowConfirmed = (rowIndex: number) => {
    if (onDeleteRow) {
      onDeleteRow(rowIndex)
    }

    const newRowCount = Math.max(0, rows - 1)
    setRows(newRowCount)

    const newCellsMap = new Map<string, string>()
    cells.forEach((value, key) => {
      const [r, c] = key.split('-').map(Number)
      if (r < rowIndex) newCellsMap.set(key, value)
      else if (r > rowIndex) newCellsMap.set(`${r - 1}-${c}`, value)
    })
    setCells(newCellsMap)

    // Also update row heights and colors
    setRowHeights((prev) => {
      const newHeights: Record<number, number> = {}
      Object.entries(prev).forEach(([idx, height]) => {
        const r = Number(idx)
        if (r < rowIndex) newHeights[r] = height
        else if (r > rowIndex) newHeights[r - 1] = height
      })
      return newHeights
    })

    setRowColors((prev) => {
      const newColors: Record<number, string> = {}
      Object.entries(prev).forEach(([idx, color]) => {
        const r = Number(idx)
        if (r < rowIndex) newColors[r] = color
        else if (r > rowIndex) newColors[r - 1] = color
      })
      return newColors
    })

    // Shift rowIdMap locally
    setRowIdMap((prev) => {
      const newMap: Record<number, number> = {}
      Object.entries(prev).forEach(([idx, id]) => {
        const r = Number(idx)
        if (r < rowIndex) newMap[r] = id
        else if (r > rowIndex) newMap[r - 1] = id
      })
      return newMap
    })

    handleSaveInternal(undefined, newCellsMap, newRowCount)
  }

  const setCellValue = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const key = `${rowIndex}-${colIndex}`
      if (getCellValue(rowIndex, colIndex) === value) return

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
      debouncedSave()
    },
    [debouncedSave, getCellValue]
  )

  const handleHeaderChange = (colIndex: number, label: string) => {
    if (columnHeaders.some((col, idx) => idx !== colIndex && (col.name || col.label) === label)) {
      SonnerToaster({
        type: 'error',
        message: 'Trùng tên cột',
        description: `Tên cột "${label}" đã tồn tại.`,
      })
      return
    }
    const newHeaders = [...columnHeaders]
    newHeaders[colIndex] = { ...newHeaders[colIndex], label, name: label }
    setColumnHeaders(newHeaders)
    handleSaveInternal(newHeaders)
  }

  // Sync with props
  useEffect(() => {
    if (workBoard) {
      setRows(workBoard.rows)
      setColumnHeaders(workBoard.columnHeaders || [])
      setOriginalColumns((workBoard.columnHeaders || []).map((col) => ({ ...col })))

      const cellsMap = new Map<string, string>()
      workBoard.cells?.forEach((cell) => {
        cellsMap.set(`${cell.rowIndex}-${cell.columnIndex}`, cell.value)
      })
      setCells(cellsMap)

      // Sync row heights and colors
      if (workBoard.rowHeights) {
        setRowHeights(workBoard.rowHeights)
      }
      if (workBoard.rowColors) {
        setRowColors(workBoard.rowColors)
      }
      if (workBoard.rowIdMap) {
        setRowIdMap(workBoard.rowIdMap)
      }
    }
  }, [workBoard])

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 bg-muted/10 rounded-xl border border-border/20">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={handleAddRow}
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm hàng
          </Button>
          <div className="h-4 w-px bg-border/40 mx-1" />
          <Button
            onClick={() => setShowColumnManager(true)}
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Settings2 className="h-3.5 w-3.5" /> Quản lý cột
          </Button>
          <div className="h-4 w-px bg-border/40 mx-1" />
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isFetching}
            className="h-8 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all"
          >
            <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />{' '}
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
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
            Sẵn sàng
          </span>
        </div>
      </div>

      {/* Table Content */}
      <Card
        ref={containerRef}
        className="overflow-hidden border border-border/20 shadow-sm rounded-xl bg-card/30 backdrop-blur-sm relative"
      >
        {/* Resize Guidelines - Constrained to Table */}
        {resizeGuide && (
          <div
            className={cn(
              'absolute bg-gray-400 z-[50] pointer-events-none fade-in zoom-in duration-200',
              resizeGuide.type === 'col' ? 'w-px top-0 bottom-0' : 'h-px left-0 right-0'
            )}
            style={{
              [resizeGuide.type === 'col' ? 'left' : 'top']: resizeGuide.pos,
            }}
          />
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
            <h3 className="text-xl font-bold mb-2">Chưa có cột nào</h3>
            <Button
              onClick={() => setShowColumnManager(true)}
              className="rounded-xl h-11 px-8 shadow-sm font-bold"
            >
              <Plus className="h-4 w-4 mr-2" /> Thiết lập cột
            </Button>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="relative w-full overflow-auto h-[calc(100vh-220px)] custom-scrollbar"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize() + 40}px`, // +40 for header
                width: '100%',
                position: 'relative',
              }}
            >
              <VirtualizedTableHeader
                columns={columnHeaders}
                editingCell={editingCell}
                onStartEdit={(r, c) => setEditingCell({ row: r, col: c })}
                onEndEdit={() => setEditingCell(null)}
                onHeaderChange={handleHeaderChange}
                onShowStatistics={(colIdx) =>
                  setStatisticsColumnName(columnHeaders[colIdx].name || columnHeaders[colIdx].label)
                }
                onColumnResize={handleColumnResize}
                rowsCount={rows}
                getCellValue={getCellValue}
                onResizeGuide={handleResizeGuide}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 40, // Height of header
                  left: 0,
                  width: '100%',
                  transform: `translateY(${rowVirtualizer.getVirtualItems()?.[0]?.start ?? 0}px)`,
                }}
              >
                {(rowVirtualizer.getVirtualItems() || []).map((virtualRow) => (
                  <VirtualizedTableRow
                    key={virtualRow.key}
                    rowIndex={virtualRow.index}
                    columns={columnHeaders}
                    getCellValue={getCellValue}
                    onValueChange={setCellValue}
                    onDeleteRow={(idx) => {
                      setRowIndexToDelete(idx)
                      setOpenConfirm(true)
                    }}
                    onRowResize={handleRowResize}
                    onRowColorChange={handleRowColorChange}
                    rowHeight={rowHeights[virtualRow.index] || 40}
                    rowColor={rowColors[virtualRow.index]}
                    editingCell={editingCell}
                    onStartEdit={(r, c) => setEditingCell({ row: r, col: c })}
                    onEndEdit={() => setEditingCell(null)}
                    onResizeGuide={handleResizeGuide}
                  />
                ))}

                {/* Last row add button row (static or virtualized) */}
                <div className="group/row hover:bg-muted/20 transition-all relative border-b border-border/20 flex w-max min-w-full">
                  <div className="w-16 h-10 bg-muted/10 sticky left-0 z-10 p-0">
                    <Button
                      variant="ghost"
                      className="w-full h-full rounded-none hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all flex flex-col items-center justify-center gap-1 group"
                      onClick={handleAddRow}
                    >
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
                  {columnHeaders.map((col, i) => (
                    <div
                      key={i}
                      style={{ width: col.width || 200 }}
                      className="h-10 border-r border-border/10 transition-all shrink-0"
                    />
                  ))}
                  {/* Spacer to fill remaining width */}
                  <div className="flex-1 border-r border-border/10 min-w-[50px]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <ColumnManager
        open={showColumnManager}
        onOpenChange={setShowColumnManager}
        columns={columnHeaders}
        onColumnsChange={(newCols) => {
          setColumnHeaders(newCols)
          handleSaveInternal(newCols)
        }}
      />

      <DialogConfirm
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={() => handleDeleteRowConfirmed(rowIndexToDelete)}
        title="Bạn có chắc chắn muốn xóa hàng này?"
        description="Hành động này không thể hoàn tác."
      />

      {sheetId && statisticsColumnName && (
        <ColumnStatisticsModal
          open={!!statisticsColumnName}
          onOpenChange={(open) => {
            if (!open) setStatisticsColumnName(null)
          }}
          sheetId={sheetId}
          columnName={statisticsColumnName}
        />
      )}
    </div>
  )
}
