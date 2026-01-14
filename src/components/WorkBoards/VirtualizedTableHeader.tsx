import React, { useRef, useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { IWorkBoardColumn } from '@/types/WorkBoard'
import { cn } from '@/lib/utils'

interface VirtualizedTableHeaderProps {
  columns: IWorkBoardColumn[]
  editingCell: { row: number; col: number } | null
  onStartEdit: (rowIndex: number, colIndex: number) => void
  onEndEdit: () => void
  onHeaderChange: (colIndex: number, label: string) => void
  onShowStatistics: (colIndex: number) => void
  rowsCount: number
  getCellValue: (rowIndex: number, colIndex: number) => string
}

export const VirtualizedTableHeader: React.FC<VirtualizedTableHeaderProps> = React.memo(
  ({
    columns,
    editingCell,
    onStartEdit,
    onEndEdit,
    onHeaderChange,
    onShowStatistics,
    rowsCount,
    getCellValue,
  }) => {
    const [headerValue, setHeaderValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      if (editingCell?.row === -1 && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [editingCell])

    return (
      <div className="sticky top-0 z-20 flex w-max min-w-full">
        <div className="w-16 h-10 bg-muted/20 backdrop-blur-sm sticky left-0 z-30 border-r border-border/30 font-bold text-muted-foreground/80 text-center flex items-center justify-center shrink-0">
          <div className="text-[10px] tracking-widest">#</div>
        </div>

        {columns.map((col, colIndex) => {
          const columnColor = col.color || '#FFFFFF'
          const isEditing = editingCell?.row === -1 && editingCell?.col === colIndex
          const isDefaultColor =
            columnColor === '#FFFFFF' || columnColor.toLowerCase() === 'transparent'

          return (
            <div
              key={col.id || colIndex}
              style={!isDefaultColor ? { backgroundColor: `${columnColor}50` } : {}}
              className={cn(
                'w-[200px] max-w-[200px] h-10 p-0 whitespace-nowrap border-b border-border/15 bg-muted/10 dark:bg-muted/5 backdrop-blur-sm hover:bg-muted/20 transition-colors flex items-center overflow-hidden shrink-0'
              )}
            >
              {isEditing ? (
                <div className="px-3 w-full">
                  <Input
                    ref={inputRef}
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    onBlur={() => {
                      onHeaderChange(colIndex, headerValue || col.label)
                      onEndEdit()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onHeaderChange(colIndex, headerValue || col.label)
                        onEndEdit()
                      } else if (e.key === 'Escape') {
                        onEndEdit()
                      }
                    }}
                    className="h-8 rounded-lg border-primary shadow-sm font-semibold text-foreground bg-background"
                  />
                </div>
              ) : (
                <div
                  className="group w-full h-full flex items-center justify-between px-4 cursor-pointer hover:bg-background/50 transition-all border-t-[3px] min-w-0"
                  style={{ borderTopColor: columnColor }}
                  onClick={() => {
                    setHeaderValue(col.label)
                    onStartEdit(-1, colIndex)
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
                      // Check if column has data to show statistics
                      const hasData = Array.from({ length: Math.min(rowsCount, 20) }).some(
                        (_, rowIdx) => {
                          const val = getCellValue(rowIdx, colIndex)
                          return val && val.trim() !== ''
                        }
                      )

                      if (!hasData || col.type === 'text') return null

                      return (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-primary transition-all shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShowStatistics(colIndex)
                          }}
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Button>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)
