import React, { useState, useEffect } from 'react'
import { GripVertical, Plus, Trash2, Settings2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { IWorkBoardColumn } from '@/types/WorkBoard'

interface ColumnManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: IWorkBoardColumn[]
  onColumnsChange: (columns: IWorkBoardColumn[]) => void
}

const COLUMN_TYPES = [
  { value: 'text', label: 'Văn bản', icon: '📝' },
  { value: 'number', label: 'Số', icon: '🔢' },
  { value: 'select', label: 'Lựa chọn', icon: '📋' },
]

const COLOR_PRESETS = [
  { name: 'Trắng', value: '#FFFFFF' },
  { name: 'Xanh dương nhạt', value: '#DBEAFE' },
  { name: 'Xanh lá nhạt', value: '#D1FAE5' },
  { name: 'Vàng nhạt', value: '#FEF3C7' },
  { name: 'Đỏ nhạt', value: '#FEE2E2' },
  { name: 'Tím nhạt', value: '#EDE9FE' },
  { name: 'Hồng nhạt', value: '#FCE7F3' },
  { name: 'Cam nhạt', value: '#FFEDD5' },
]

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  open,
  onOpenChange,
  columns,
  onColumnsChange,
}) => {
  const [localColumns, setLocalColumns] = useState<IWorkBoardColumn[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      setLocalColumns(columns.map((col) => ({ ...col })))
    }
  }, [open, columns])

  const handleAddColumn = () => {
    const newColumn: IWorkBoardColumn = {
      id: `col-new-${Date.now()}`,
      label: `Cột mới ${localColumns.length + 1}`,
      name: `Cột mới ${localColumns.length + 1}`,
      type: 'text',
      width: 150,
      index: localColumns.length,
      color: '#FFFFFF',
      required: false,
      options: [],
    }
    setLocalColumns([...localColumns, newColumn])
    setEditingId(newColumn.id)
  }

  const handleDeleteColumn = (id: string) => {
    setLocalColumns(localColumns.filter((col) => col.id !== id))
  }

  const handleUpdateColumn = (id: string, updates: Partial<IWorkBoardColumn>) => {
    setLocalColumns(localColumns.map((col) => (col.id === id ? { ...col, ...updates } : col)))
  }

  const handleAddOption = (columnId: string, option: string) => {
    const column = localColumns.find((col) => col.id === columnId)
    if (column) {
      const newOptions = [...(column.options || []), option]
      handleUpdateColumn(columnId, { options: newOptions })
    }
  }

  const handleRemoveOption = (columnId: string, optionIndex: number) => {
    const column = localColumns.find((col) => col.id === columnId)
    if (column) {
      const newOptions = column.options?.filter((_, idx) => idx !== optionIndex) || []
      handleUpdateColumn(columnId, { options: newOptions })
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newColumns = [...localColumns]
    const draggedColumn = newColumns[draggedIndex]
    newColumns.splice(draggedIndex, 1)
    newColumns.splice(index, 0, draggedColumn)

    // Update indices
    newColumns.forEach((col, idx) => {
      col.index = idx
    })

    setLocalColumns(newColumns)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSave = () => {
    onColumnsChange(localColumns)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Quản lý cột
          </SheetTitle>
          <SheetDescription>
            Thêm, xóa, chỉnh sửa và sắp xếp các cột trong bảng của bạn
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Add Column Button */}
          <Button onClick={handleAddColumn} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Thêm cột mới
          </Button>

          {/* Columns List */}
          <div className="space-y-3">
            {localColumns.map((column, index) => (
              <ColumnCard
                key={column.id}
                column={column}
                isEditing={editingId === column.id}
                onEdit={() => setEditingId(column.id)}
                onCancelEdit={() => setEditingId(null)}
                onUpdate={(updates) => handleUpdateColumn(column.id, updates)}
                onDelete={() => handleDeleteColumn(column.id)}
                onAddOption={(option) => handleAddOption(column.id, option)}
                onRemoveOption={(optionIndex) => handleRemoveOption(column.id, optionIndex)}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
              />
            ))}
          </div>

          {localColumns.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chưa có cột nào</p>
              <p className="text-sm mt-1">Nhấn "Thêm cột mới" để bắt đầu</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t pt-4 mt-6 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Hủy
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Áp dụng thay đổi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ColumnCardProps {
  column: IWorkBoardColumn
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onUpdate: (updates: Partial<IWorkBoardColumn>) => void
  onDelete: () => void
  onAddOption: (option: string) => void
  onRemoveOption: (optionIndex: number) => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}

const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onAddOption,
  onRemoveOption,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}) => {
  const [optionInput, setOptionInput] = useState('')

  const handleAddOption = () => {
    if (optionInput.trim()) {
      onAddOption(optionInput.trim())
      setOptionInput('')
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'border rounded-lg p-4 bg-card transition-all',
        isDragging && 'opacity-50 scale-95',
        !isDragging && 'hover:shadow-md'
      )}
      style={{ borderLeftColor: column.color, borderLeftWidth: '4px' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="cursor-move mt-1">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Column Name */}
          <div className="flex items-center gap-2">
            <Input
              value={column.label}
              onChange={(e) => onUpdate({ label: e.target.value, name: e.target.value })}
              className="font-medium"
              placeholder="Tên cột"
            />
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Settings2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Expanded Settings */}
          {isEditing && (
            <div className="space-y-4 pt-2 border-t">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Kiểu dữ liệu</Label>
                <Select
                  value={column.type || 'text'}
                  onValueChange={(value) => onUpdate({ type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onUpdate({ color: preset.value })}
                      className={cn(
                        'h-10 rounded-md border-2 transition-all hover:scale-105',
                        column.color === preset.value
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={column.color || '#FFFFFF'}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={column.color || '#FFFFFF'}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center justify-between">
                <Label>Bắt buộc</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={column.required || false}
                    onCheckedChange={(checked) => onUpdate({ required: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {column.required ? 'Có' : 'Không'}
                  </span>
                </div>
              </div>

              {/* Options (for select type) */}
              {column.type === 'select' && (
                <div className="space-y-2">
                  <Label>Tùy chọn</Label>
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Nhập tùy chọn..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddOption()
                        }
                      }}
                    />
                    <Button onClick={handleAddOption} size="sm" type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {column.options?.map((option, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {option}
                        <button
                          onClick={() => onRemoveOption(idx)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {(!column.options || column.options.length === 0) && (
                    <p className="text-xs text-muted-foreground">
                      Chưa có tùy chọn nào. Thêm tùy chọn để người dùng có thể chọn.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Compact Info when not editing */}
          {!isEditing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {COLUMN_TYPES.find((t) => t.value === column.type)?.label || 'Văn bản'}
              </Badge>
              {column.required && (
                <Badge variant="secondary" className="text-xs">
                  Bắt buộc
                </Badge>
              )}
              {column.type === 'select' && column.options && column.options.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {column.options.length} tùy chọn
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
