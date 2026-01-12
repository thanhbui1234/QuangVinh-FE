import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Settings2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DialogConfirm } from '../ui/alertComponent'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { IWorkBoardColumn } from '@/types/WorkBoard'
import SonnerToaster from '@/components/ui/toaster'

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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
    setDeleteConfirmId(id)
  }

  const executeDeleteColumn = () => {
    if (deleteConfirmId) {
      const newColumns = localColumns.filter((col) => col.id !== deleteConfirmId)
      setLocalColumns(newColumns)
      onColumnsChange(newColumns)
      setDeleteConfirmId(null)
    }
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
    // Validate select columns
    const invalidColumns = localColumns.filter(
      (col) => col.type === 'select' && (!col.options || col.options.length === 0)
    )

    if (invalidColumns.length > 0) {
      invalidColumns.forEach((col) => {
        SonnerToaster({
          type: 'error',
          message: 'Lỗi xác thực',
          description: `Vui lòng thêm ít nhất một tùy chọn cho cột: ${col.label}`,
        })
        // Highlight the first invalid column by setting it as editing
        setEditingId(col.id)
      })
      return
    }

    // Validate duplicate column names
    const names = localColumns.map((col) => col.name || col.label)
    const duplicateName = names.find((name, index) => names.indexOf(name) !== index)

    if (duplicateName) {
      SonnerToaster({
        type: 'error',
        message: 'Lỗi xác thực',
        description: `Tên cột "${duplicateName}" bị trùng. Vui lòng sử dụng tên duy nhất cho mỗi cột.`,
      })
      return
    }

    onColumnsChange(localColumns)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 overflow-hidden border-l border-border shadow-2xl bg-background"
      >
        <div className="flex flex-col h-full">
          {/* Custom Header */}
          <div className="p-8 pb-6 bg-card border-b border-border">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold tracking-tight">Quản lý cột</SheetTitle>
                <SheetDescription className="text-muted-foreground font-medium">
                  Tùy chỉnh cấu trúc và định dạng dữ liệu cho bảng
                </SheetDescription>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Add Column Button */}
            <Button
              onClick={handleAddColumn}
              className="w-full h-14 rounded-2xl bg-card border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2 font-bold shadow-sm"
              variant="ghost"
            >
              <Plus className="h-5 w-5" />
              Thêm cột mới
            </Button>

            {/* Columns List */}
            <div className="space-y-4">
              {localColumns.map((column, index) => (
                <ColumnCard
                  key={column.id}
                  column={column}
                  isEditing={editingId === column.id}
                  onEdit={() => setEditingId(column.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={(updates: Partial<IWorkBoardColumn>) =>
                    handleUpdateColumn(column.id, updates)
                  }
                  onDelete={() => handleDeleteColumn(column.id)}
                  onAddOption={(option: string) => handleAddOption(column.id, option)}
                  onRemoveOption={(optionIndex: number) =>
                    handleRemoveOption(column.id, optionIndex)
                  }
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e: React.DragEvent) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedIndex === index}
                  onSetEditingId={setEditingId}
                />
              ))}
            </div>

            {localColumns.length === 0 && (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                  Danh sách trống
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-card border-t border-border flex gap-3 shadow-md">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl font-bold shadow-sm transition-all"
            >
              <Check className="h-4 w-4 mr-2" />
              Cập nhật cấu trúc
            </Button>
          </div>
        </div>
      </SheetContent>
      <DialogConfirm
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={executeDeleteColumn}
        title="Bạn có chắc chắn muốn xóa cột này?"
        description="Hành động này sẽ xóa cột và tất cả dữ liệu trong cột đó. Không thể hoàn tác."
      />
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

const ColumnCard: React.FC<ColumnCardProps & { onSetEditingId: (id: string | null) => void }> = ({
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
  onSetEditingId,
}) => {
  const [optionInput, setOptionInput] = useState('')

  const handleAddOption = () => {
    if (optionInput.trim()) {
      onAddOption(optionInput.trim())
      setOptionInput('')
    }
  }

  const columnTypeLabel = COLUMN_TYPES.find((t) => t.value === column.type) || COLUMN_TYPES[0]

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'group/card rounded-2xl bg-card border border-border shadow-sm transition-all duration-200 relative overflow-hidden',
        isDragging && 'opacity-30 scale-95 blur-sm',
        !isDragging && 'hover:shadow-md hover:border-primary/40',
        isEditing && 'ring-2 ring-primary ring-inset z-20'
      )}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover/card:w-2"
        style={{ backgroundColor: column.color || '#FFFFFF' }}
      />

      <div className="p-5 flex gap-4">
        {/* Drag Handle */}
        <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing opacity-30 group-hover/card:opacity-100 transition-opacity pt-1.5 shrink-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {/* Main Info */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Input
                value={column.label}
                onChange={(e) => onUpdate({ label: e.target.value, name: e.target.value })}
                className="h-9 border-transparent bg-transparent hover:bg-muted/50 focus:bg-background focus:border-border rounded-lg font-bold text-foreground text-md p-0 px-2 transition-all truncate"
                placeholder="Tên cột..."
              />
              <div className="flex items-center gap-2 mt-1 px-2">
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground font-bold text-[10px] uppercase tracking-wider rounded-md border-none"
                >
                  {columnTypeLabel.icon} {columnTypeLabel.label}
                </Badge>
                {column.required && (
                  <Badge className="bg-amber-500/10 text-amber-500 font-bold text-[10px] uppercase tracking-wider rounded-md border-none">
                    Bắt buộc
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={isEditing ? onCancelEdit : onEdit}
                className={cn(
                  'h-9 w-9 rounded-lg transition-all',
                  isEditing
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {isEditing ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-9 w-9 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Section */}
          {isEditing && (
            <div className="space-y-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-2 duration-300 pb-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Kiểu dữ liệu
                  </Label>
                  <Select
                    value={column.type || 'text'}
                    onValueChange={(value) => onUpdate({ type: value })}
                  >
                    <SelectTrigger className="rounded-lg border-border h-10 font-semibold bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border shadow-xl">
                      {COLUMN_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="rounded-lg m-1 font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Validation */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ràng buộc
                  </Label>
                  <div className="flex items-center justify-between bg-muted/30 h-10 p-2.5 rounded-lg border border-border">
                    <span className="text-xs font-semibold text-muted-foreground">Bắt buộc</span>
                    <Switch
                      checked={column.required || false}
                      onCheckedChange={(checked) => onUpdate({ required: checked })}
                      className="scale-90"
                    />
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Màu sắc định danh
                </Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onUpdate({ color: preset.value })}
                      className={cn(
                        'h-8 w-8 rounded-lg border transition-all hover:scale-110 shadow-sm border-background',
                        column.color === preset.value
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'ring-1 ring-border'
                      )}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Options */}
              {column.type === 'select' && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Danh sách lựa chọn
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => {
                        onSetEditingId(column.id)
                        setOptionInput(e.target.value)
                      }}
                      placeholder="Nhập giá trị..."
                      className="h-9 border-border rounded-lg font-semibold bg-background"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddOption()
                        }
                      }}
                    />
                    <Button onClick={handleAddOption} size="sm" className="h-9 w-9 rounded-lg">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {column.options?.map((option, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 bg-background border border-border text-foreground font-semibold rounded-lg gap-2"
                      >
                        {option}
                        <button
                          onClick={() => onRemoveOption(idx)}
                          className="h-5 w-5 rounded-md flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {(!column.options || column.options.length === 0) && (
                    <p className="text-[10px] text-muted-foreground font-bold tracking-tight text-center py-1">
                      Vui lòng thêm ít nhất một giá trị
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
