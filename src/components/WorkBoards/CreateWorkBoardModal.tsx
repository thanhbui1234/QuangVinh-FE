import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ICreateWorkBoard } from '@/types/WorkBoard'

interface CreateWorkBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ICreateWorkBoard) => void
  isSubmitting?: boolean
}

export const CreateWorkBoardModal: React.FC<CreateWorkBoardModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rows, setRows] = useState(5)
  const [columns, setColumns] = useState(5)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const columnHeaders = Array.from({ length: columns }, (_, i) => ({
      id: `col-${i}`,
      label: `Cột ${i + 1}`,
      width: 150,
    }))

    onSubmit({
      name,
      description,
      rows,
      columns,
      columnHeaders,
      cells: [],
    })
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setRows(5)
    setColumns(5)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo bảng công việc mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên bảng *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên bảng công việc"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả (tùy chọn)"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Số hàng *</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="100"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columns">Số cột *</Label>
              <Input
                id="columns"
                type="number"
                min="1"
                max="50"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value) || 1)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo bảng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
