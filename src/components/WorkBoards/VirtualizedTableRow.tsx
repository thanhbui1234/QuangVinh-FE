import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VirtualizedTableCell } from './VirtualizedTableCell'
import type { IWorkBoardColumn } from '@/types/WorkBoard'

interface VirtualizedTableRowProps {
  rowIndex: number
  columns: IWorkBoardColumn[]
  getCellValue: (rowIndex: number, colIndex: number) => string
  onValueChange: (rowIndex: number, colIndex: number, value: string) => void
  onDeleteRow: (rowIndex: number) => void
  editingCell: { row: number; col: number } | null
  onStartEdit: (rowIndex: number, colIndex: number) => void
  onEndEdit: () => void
  virtualRow?: any // Handle tanstack virtual row if needed
}

export const VirtualizedTableRow: React.FC<VirtualizedTableRowProps> = React.memo(
  ({
    rowIndex,
    columns,
    getCellValue,
    onValueChange,
    onDeleteRow,
    editingCell,
    onStartEdit,
    onEndEdit,
  }) => {
    return (
      <div className="group/row hover:bg-muted/20 transition-all relative border-b border-border/20 flex w-max min-w-full">
        {/* Row Number Column */}
        <div className="w-16 h-10 bg-[#f8f8f8] dark:bg-[#151518] sticky left-0 z-10 border-r border-border/20 text-center font-bold text-muted-foreground/50 px-0 leading-none backdrop-blur-sm shrink-0">
          <div className="flex flex-col items-center justify-center relative min-h-[40px]">
            <span className="group-hover/row:opacity-0 transition-opacity text-[10px]">
              {rowIndex + 1}
            </span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity bg-muted/95 backdrop-blur-md">
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
        </div>

        {/* Data Cells */}
        {columns.map((col, colIndex) => (
          <VirtualizedTableCell
            key={col.id || colIndex}
            rowIndex={rowIndex}
            colIndex={colIndex}
            value={getCellValue(rowIndex, colIndex)}
            column={col}
            onValueChange={onValueChange}
            isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
            onStartEdit={onStartEdit}
            onEndEdit={onEndEdit}
          />
        ))}
      </div>
    )
  }
)
