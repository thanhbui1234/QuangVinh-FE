import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { IWorkBoardColumn } from '@/types/WorkBoard'

interface ColumnSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  column: IWorkBoardColumn | null
  onSave: (column: IWorkBoardColumn) => void
}

const COLUMN_TYPES = [
  { value: 'text', label: 'Văn bản' },
  { value: 'number', label: 'Số' },
  { value: 'select', label: 'Lựa chọn' },
]

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({
  open,
  onOpenChange,
  column,
  onSave,
}) => {
  const [columnName, setColumnName] = useState('')
  const [columnType, setColumnType] = useState<string>('text')
  const [columnColor, setColumnColor] = useState('#FFFFFF')
  const [columnRequired, setColumnRequired] = useState(false)
  const [optionsInput, setOptionsInput] = useState('')

  useEffect(() => {
    if (column) {
      setColumnName(column.name || column.label || '')
      setColumnType(column.type || 'text')
      setColumnColor(column.color || '#FFFFFF')
      setColumnRequired(column.required || false)
      setOptionsInput((column.options || []).join(', '))
    }
  }, [column, open])

  const handleSave = () => {
    if (!column) return

    const options = optionsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const updatedColumn: IWorkBoardColumn = {
      ...column,
      name: columnName,
      label: columnName,
      type: columnType,
      color: columnColor,
      required: columnRequired,
      options: columnType === 'select' ? options : [],
    }

    onSave(updatedColumn)
    onOpenChange(false)
  }

  if (!column) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cài đặt cột: {column.label || column.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Column Name */}
          <div className="space-y-2">
            <Label htmlFor="column-name">Tên cột</Label>
            <Input
              id="column-name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Nhập tên cột"
            />
          </div>

          {/* Column Type */}
          <div className="space-y-2">
            <Label htmlFor="column-type">Kiểu dữ liệu</Label>
            <select
              id="column-type"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={columnType}
              onChange={(e) => setColumnType(e.target.value)}
            >
              {COLUMN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Column Color */}
          <div className="space-y-2">
            <Label htmlFor="column-color">Màu sắc</Label>
            <div className="flex items-center gap-3">
              <Input
                id="column-color"
                type="color"
                value={columnColor}
                onChange={(e) => setColumnColor(e.target.value)}
                className="h-10 w-20 px-1 cursor-pointer"
              />
              <Input
                type="text"
                value={columnColor}
                onChange={(e) => setColumnColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* Required */}
          <div className="flex items-center justify-between">
            <Label htmlFor="column-required">Bắt buộc</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="column-required"
                checked={columnRequired}
                onCheckedChange={setColumnRequired}
              />
              <span className="text-sm text-muted-foreground">
                {columnRequired ? 'Có' : 'Không'}
              </span>
            </div>
          </div>

          {/* Options (only for select type) */}
          {columnType === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="column-options">Tùy chọn (phân cách bằng dấu phẩy)</Label>
              <Input
                id="column-options"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Ví dụ: Option 1, Option 2, Option 3"
                onBlur={() => {
                  // Validate options on blur
                  const options = optionsInput
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                  setOptionsInput(options.join(', '))
                }}
              />
              <p className="text-xs text-muted-foreground">
                Các hàng trong cột này chỉ có thể chọn từ các tùy chọn trên
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
