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
        className="w-full sm:max-w-xl p-0 overflow-hidden border-l border-slate-200 shadow-2xl bg-slate-50/95 backdrop-blur-xl"
      >
        <div className="flex flex-col h-full">
          {/* Custom Header */}
          <div className="p-8 pb-6 bg-white/50 border-b border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  Quản lý cột
                </SheetTitle>
                <SheetDescription className="text-slate-400 font-medium">
                  Tùy chỉnh cấu trúc và định dạng dữ liệu cho bảng
                </SheetDescription>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Add Column Button */}
            <Button
              onClick={handleAddColumn}
              className="w-full h-14 rounded-2xl bg-white border-2 border-dashed border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all gap-2 font-bold shadow-sm"
              variant="ghost"
            >
              <Plus className="h-5 w-5" />
              Thêm cột dữ liệu mới
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
                <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-200">
                  <Plus className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Danh sách trống
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-white border-t border-slate-200 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-12 rounded-xl font-black tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              <Check className="h-5 w-5 mr-2" />
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
        'group/card rounded-3xl bg-white border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden',
        isDragging && 'opacity-30 scale-95 blur-sm',
        !isDragging && 'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1',
        isEditing && 'ring-2 ring-primary ring-inset shadow-2xl z-20'
      )}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover/card:w-2"
        style={{ backgroundColor: column.color || '#FFFFFF' }}
      />

      <div className="p-5 flex gap-4">
        {/* Drag Handle */}
        <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing opacity-30 group-hover/card:opacity-100 transition-opacity pt-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-slate-400" />
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {/* Main Info */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Input
                value={column.label}
                onChange={(e) => onUpdate({ label: e.target.value, name: e.target.value })}
                className="h-10 border-transparent bg-transparent hover:bg-slate-50 focus:bg-white focus:border-slate-200 rounded-xl font-black text-slate-800 text-lg p-0 px-2 transition-all truncate"
                placeholder="Tên cột..."
              />
              <div className="flex items-center gap-2 mt-1 px-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-lg border-none"
                >
                  {columnTypeLabel.icon} {columnTypeLabel.label}
                </Badge>
                {column.required && (
                  <Badge className="bg-amber-50 text-amber-600 font-bold text-[10px] uppercase tracking-wider rounded-lg border-amber-100">
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
                  'h-10 w-10 rounded-xl transition-all',
                  isEditing
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
              >
                {isEditing ? <Check className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Settings Section */}
          {isEditing && (
            <div className="space-y-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500 pb-2">
              <div className="grid grid-cols-2 gap-6">
                {/* Type */}
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Kiểu dữ liệu
                  </Label>
                  <Select
                    value={column.type || 'text'}
                    onValueChange={(value) => onUpdate({ type: value })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold text-slate-700 bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {COLUMN_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="rounded-xl m-1 font-bold"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-lg">{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Validation */}
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">
                    Ràng buộc
                  </Label>
                  <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-600">Bắt buộc nhập</span>
                    <Switch
                      checked={column.required || false}
                      onCheckedChange={(checked) => onUpdate({ required: checked })}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Bảng màu sắc
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onUpdate({ color: preset.value })}
                      className={cn(
                        'h-9 w-9 rounded-xl border-2 transition-all hover:scale-110 shadow-sm border-white',
                        column.color === preset.value
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'ring-1 ring-slate-100'
                      )}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                  <div className="relative group">
                    <Input
                      type="color"
                      value={column.color || '#FFFFFF'}
                      onChange={(e) => onUpdate({ color: e.target.value })}
                      className="h-9 w-9 p-0 border-none rounded-xl cursor-pointer ring-1 ring-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              {column.type === 'select' && (
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Danh sách lựa chọn
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => {
                        onSetEditingId(column.id)
                        setOptionInput(e.target.value)
                      }}
                      placeholder="Nhập giá trị mới..."
                      className="h-10 border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 transition-all px-4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddOption()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddOption}
                      size="icon"
                      className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {column.options?.map((option, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl gap-2 shadow-sm"
                      >
                        {option}
                        <button
                          onClick={() => onRemoveOption(idx)}
                          className="h-5 w-5 rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {(!column.options || column.options.length === 0) && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight text-center py-2">
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
