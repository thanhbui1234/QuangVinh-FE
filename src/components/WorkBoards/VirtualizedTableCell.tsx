import React, { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { IWorkBoardColumn } from '@/types/WorkBoard'

interface VirtualizedTableCellProps {
  rowIndex: number
  colIndex: number
  value: string
  column: IWorkBoardColumn
  rowColor?: string
  onValueChange: (rowIndex: number, colIndex: number, value: string) => void
  isEditing: boolean
  onStartEdit: (rowIndex: number, colIndex: number) => void
  onEndEdit: () => void
}

export const VirtualizedTableCell: React.FC<VirtualizedTableCellProps> = React.memo(
  ({ rowIndex, colIndex, value, column, onValueChange, isEditing, onStartEdit, onEndEdit }) => {
    const [localValue, setLocalValue] = useState(value)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync local value with prop value when not editing
    useEffect(() => {
      if (!isEditing) {
        setLocalValue(value)
      }
    }, [value, isEditing])

    // Focus textarea/input when starts editing
    useEffect(() => {
      if (isEditing) {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(localValue.length, localValue.length)
        } else if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }
    }, [isEditing])

    const handleBlur = () => {
      if (localValue !== value) {
        onValueChange(rowIndex, colIndex, localValue)
      }
      onEndEdit()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow Enter for new line, Shift+Enter also for new line
      // But maybe user wants Ctrl+Enter to save?
      // For now, let's keep Enter as new line for textarea, and rely on blur to save.
      if (e.key === 'Escape') {
        setLocalValue(value)
        onEndEdit()
      }
    }

    const columnColor = column.color || '#FFFFFF'
    const isDefaultColor =
      columnColor.toUpperCase() === '#FFFFFF' ||
      columnColor.toLowerCase() === 'transparent' ||
      !column.color

    const hasOptions = column?.options && column.options.length > 0
    const columnType = column?.type || 'text'

    // Determine final background color
    const getBgStyle = () => {
      const styles: React.CSSProperties = {
        width: column.width || 200,
        backgroundColor: 'transparent', // Default to transparent to show row color
      }

      if (!isDefaultColor) {
        // If column has a specific color, apply it with alpha
        styles.backgroundColor = `${columnColor}40`
      }

      return styles
    }

    return (
      <div
        style={getBgStyle()}
        className={cn(
          'h-full p-0 border-r border-border/10 transition-all group/cell flex flex-col justify-center overflow-hidden shrink-0',
          isEditing
            ? 'ring-1 ring-primary/40 ring-inset z-50 shadow-md shadow-primary/5'
            : 'hover:bg-muted/15'
        )}
      >
        {columnType === 'select' && hasOptions ? (
          <Select
            value={value || 'EMPTY_VALUE'}
            onValueChange={(val) =>
              onValueChange(rowIndex, colIndex, val === 'EMPTY_VALUE' ? '' : val)
            }
          >
            <SelectTrigger className="border-0 focus:ring-0 h-full w-full px-4 rounded-none shadow-none bg-transparent hover:bg-muted/20 transition-colors font-medium text-foreground/80 overflow-hidden">
              <SelectValue placeholder="Chọn..." className="truncate bg-transparent" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/20 shadow-2xl bg-popover/90 backdrop-blur-xl">
              <SelectItem
                value="EMPTY_VALUE"
                className="rounded-lg m-1 font-medium text-muted-foreground italic"
              >
                Chọn...
              </SelectItem>
              {column.options?.map((option, idx) => (
                <SelectItem key={idx} value={option} className="rounded-lg m-1 font-medium">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isEditing ? (
          <div className="relative w-full h-full flex items-start px-2 py-2 z-30 shadow-inner bg-transparent">
            {columnType === 'number' ? (
              <Input
                ref={inputRef}
                type="number"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="border-0 focus-visible:ring-0 h-9 w-full p-0 bg-transparent font-medium text-foreground selection:bg-primary/20"
              />
            ) : (
              <Textarea
                ref={textareaRef}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="border-0 focus-visible:ring-0 w-full h-full p-0 bg-transparent font-medium text-foreground selection:bg-primary/20 resize-none leading-normal min-h-[24px]"
              />
            )}
          </div>
        ) : (
          <div
            className="px-4 py-2 w-full h-full flex items-start cursor-pointer transition-all font-medium text-foreground/80 relative min-w-0 bg-transparent whitespace-pre-wrap break-words"
            onClick={() => onStartEdit(rowIndex, colIndex)}
          >
            {value ? (
              <span className="w-full bg-transparent leading-normal">{value}</span>
            ) : (
              <span className="text-muted-foreground/80 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover/cell:opacity-100 transition-all bg-transparent self-center">
                Trống
              </span>
            )}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.rowColor === nextProps.rowColor &&
      prevProps.column.id === nextProps.column.id &&
      prevProps.column.color === nextProps.column.color &&
      prevProps.column.type === nextProps.column.type &&
      prevProps.column.width === nextProps.column.width &&
      JSON.stringify(prevProps.column.options) === JSON.stringify(nextProps.column.options)
    )
  }
)
