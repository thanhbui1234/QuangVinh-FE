import React, { useRef, useCallback } from 'react'
import { Trash2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VirtualizedTableCell } from './VirtualizedTableCell'
import type { IWorkBoardColumn } from '@/types/WorkBoard'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface VirtualizedTableRowProps {
  rowIndex: number
  columns: IWorkBoardColumn[]
  getCellValue: (rowIndex: number, colIndex: number) => string
  onValueChange: (rowIndex: number, colIndex: number, value: string) => void
  onDeleteRow: (rowIndex: number) => void
  onRowResize: (rowIndex: number, height: number) => void
  onRowColorChange: (rowIndex: number, color: string) => void
  rowHeight: number
  rowColor?: string
  editingCell: { row: number; col: number } | null
  onStartEdit: (rowIndex: number, colIndex: number) => void
  onEndEdit: () => void
  virtualRow?: any
  onResizeGuide: (type: 'col' | 'row' | null, clientPos: number) => void
}

const PREDEFINED_COLORS = [
  'transparent',
  '#f87171', // red-400
  '#fb923c', // orange-400
  '#fbbf24', // amber-400
  '#facc15', // yellow-400
  '#a3e635', // lime-400
  '#4ade80', // green-400
  '#34d399', // emerald-400
  '#2dd4bf', // teal-400
  '#22d3ee', // cyan-400
  '#38bdf8', // sky-400
  '#60a5fa', // blue-400
  '#818cf8', // indigo-400
  '#a78bfa', // violet-400
  '#c084fc', // purple-400
  '#e879f9', // fuchsia-400
  '#f472b6', // pink-400
  '#fb7185', // rose-400
]

export const VirtualizedTableRow: React.FC<VirtualizedTableRowProps> = React.memo(
  ({
    rowIndex,
    columns,
    getCellValue,
    onValueChange,
    onDeleteRow,
    onRowResize,
    onRowColorChange,
    rowHeight,
    rowColor,
    editingCell,
    onStartEdit,
    onEndEdit,
    onResizeGuide,
  }) => {
    const resizingRef = useRef<{ rowIndex: number; startY: number; startHeight: number } | null>(
      null
    )

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        resizingRef.current = {
          rowIndex,
          startY: e.clientY,
          startHeight: rowHeight,
        }
        onResizeGuide('row', e.clientY)

        const onMouseMove = (moveEvent: MouseEvent) => {
          if (!resizingRef.current) return
          const deltaY = moveEvent.clientY - resizingRef.current.startY
          const newHeight = Math.max(32, resizingRef.current.startHeight + deltaY)
          onRowResize(resizingRef.current.rowIndex, newHeight)
          onResizeGuide('row', moveEvent.clientY)
        }

        const onMouseUp = () => {
          resizingRef.current = null
          onResizeGuide(null, 0)
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          document.body.style.cursor = 'default'
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        document.body.style.cursor = 'row-resize'
      },
      [rowIndex, rowHeight, onRowResize, onResizeGuide]
    )

    return (
      <div
        className="group/row hover:bg-muted/20 transition-all relative border-b border-border/20 flex w-max min-w-full"
        style={{
          height: rowHeight,
          backgroundColor: rowColor && rowColor !== 'transparent' ? `${rowColor}30` : undefined,
        }}
      >
        {/* Row Number Column */}
        <div
          className="w-16 sticky left-0 z-40 border-r border-border/20 text-center font-bold text-muted-foreground/50 px-0 leading-none backdrop-blur-sm shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
          style={{
            backgroundColor: rowColor && rowColor !== 'transparent' ? `${rowColor}30` : undefined,
          }}
        >
          <div className="absolute inset-0 bg-[#f8f8f8] dark:bg-[#151518] -z-10" />
          <div
            className="flex flex-col items-center justify-center relative min-h-full"
            style={{ height: rowHeight - 1 }}
          >
            <span className="group-hover/row:opacity-0 transition-opacity text-[10px]">
              {rowIndex + 1}
            </span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity bg-muted/95 backdrop-blur-md gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 rounded-xl border-border/20 shadow-2xl bg-popover/90 backdrop-blur-xl">
                  <div className="grid grid-cols-6 gap-1">
                    {PREDEFINED_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-md border border-border/20 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: color === 'transparent' ? undefined : color }}
                        onClick={() => onRowColorChange(rowIndex, color)}
                      >
                        {color === 'transparent' && (
                          <div className="w-full h-px bg-destructive rotate-45" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                onClick={() => onDeleteRow(rowIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Row Resize Handle */}
          <div
            className="absolute left-0 bottom-0 w-full h-1 cursor-row-resize hover:bg-primary/50 z-50 transition-colors"
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Data Cells */}
        {columns.map((col, colIndex) => (
          <VirtualizedTableCell
            key={col.id || colIndex}
            rowIndex={rowIndex}
            colIndex={colIndex}
            value={getCellValue(rowIndex, colIndex)}
            column={col}
            rowColor={rowColor}
            onValueChange={onValueChange}
            isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
            onStartEdit={onStartEdit}
            onEndEdit={onEndEdit}
          />
        ))}

        {/* Spacer to fill remaining width */}
        <div className="flex-1 border-r border-border/10 min-w-[50px]" />
      </div>
    )
  }
)
