import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/base/RichTextEditor'
import { STATUS_LABEL } from './ProjectDetailTable/columns'
import type { TaskRow } from './ProjectDetailTable/columns'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'

export type EditTaskModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: { id: string; name: string }[]
  task: TaskRow | null
  onSave: (update: Partial<TaskRow>) => void
  currentUserId?: string
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  open,
  onOpenChange,
  users,
  task,
  onSave,
  currentUserId,
}) => {
  const [title, setTitle] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [estimateHours, setEstimateHours] = useState<string>('')
  const [status, setStatus] = useState<TaskRow['status']>('todo')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!task) return
    setTitle(task.title || '')
    setDescriptionHtml(task.description || '')
    setEstimateHours(typeof task.estimateHours === 'number' ? String(task.estimateHours) : '')
    setStatus(task.status || 'todo')
    setAssigneeId(task.assigneeId || '')
  }, [task, open])

  function handleSave() {
    if (!task) return
    onSave({
      id: task.id,
      title: title.trim(),
      description: descriptionHtml.trim() || '',
      estimateHours: estimateHours ? Number(estimateHours) : undefined,
      status,
      assigneeId: assigneeId || undefined,
    })
    onOpenChange(false)
  }
  function handleAssigneeChange(value: string) {
    if (value === '__me__') {
      setAssigneeId(currentUserId || '')
      return
    }
    setAssigneeId(value)
  }
  if (!open || !task) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Task"
        className="relative w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 mx-2 animate-in fade-in zoom-in"
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
          onClick={() => onOpenChange(false)}
          aria-label="Đóng"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Heading */}
        <h2 className="text-2xl font-bold mb-2 text-black">Chỉnh sửa Task</h2>
        <p className="text-gray-400 mb-6 text-sm">Cập nhật thông tin task bên dưới</p>
        <Separator className="mb-7" />
        {/* Form */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
            <Input
              className="mt-2 rounded-lg border-gray-200 bg-white text-base px-4 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <div className="mt-2">
              <RichTextEditor
                value={descriptionHtml}
                onChange={setDescriptionHtml}
                placeholder="Write a rich description..."
                minHeight={100}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ước lượng (giờ)</label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={estimateHours}
                onChange={(e) => setEstimateHours(e.target.value)}
                placeholder="e.g. 4"
                className="mt-2 rounded-lg border-gray-200 bg-white text-base px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-2 w-full rounded-lg border-gray-200 bg-white text-base px-4 py-2 focus:outline-none"
              >
                <option value="todo">{STATUS_LABEL['todo']}</option>
                <option value="in_progress">{STATUS_LABEL['in_progress']}</option>
                <option value="pending">{STATUS_LABEL['pending']}</option>
                <option value="done">{STATUS_LABEL['done']}</option>
                <option value="rejected">{STATUS_LABEL['rejected']}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Người được giao</label>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="mt-2 w-full rounded-lg border-gray-200 bg-white text-base px-4 py-2 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {currentUserId ? <option value="__me__">Assign to me</option> : null}
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Action */}
        <div className="flex gap-3 justify-end mt-10">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-gray-200 text-gray-800 hover:border-black bg-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-black text-white px-7 py-2 font-semibold hover:bg-gray-900"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditTaskModal
