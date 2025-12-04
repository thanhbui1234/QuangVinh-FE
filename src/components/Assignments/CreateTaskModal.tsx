import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS, TASK_STATUS } from '@/constants/assignments/task'
import { X, Calendar, Image as ImageIcon, ListChecks } from 'lucide-react'
import { EditorJSComponent } from '../Editor'
import { useState } from 'react'
import { convertHTMLToEditorJS, convertEditorJSToHTML } from '@/utils/editorjs'
import type { OutputData } from '@editorjs/editorjs'
import { FileUploadValidationDemo } from '../ui/uploadFile'
export type CreateTaskFormData = {
  description: string
  priority: number
  taskType: number
  estimateTime: number
  assigneeId?: number
  status?: number
  startTime?: number
  imageUrls?: string[]
  checkList?: string
}

export type CreateTaskModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberTask: any
  onCreate: (data: CreateTaskFormData) => void
  groupId?: number
  mode?: 'create' | 'edit'
  initialData?: CreateTaskFormData
  isLoading?: boolean
}

type FormValues = {
  description: string
  priority: string
  taskType: string
  status: string
  startDate: string
  estimateDate: string
  assigneeId: string
  imageUrl: string
  checkList: string
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onOpenChange,
  memberTask,
  onCreate,
  mode = 'create',
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      description: '',
      priority: '2',
      taskType: '1',
      status: String(TASK_STATUS.CREATED),
      startDate: '',
      estimateDate: '',
      assigneeId: '',
      imageUrl: '',
      checkList: '',
    },
  })
  const [editedDescription, setEditedDescription] = useState<OutputData>(() =>
    convertHTMLToEditorJS(initialData?.checkList || '')
  )
  // Watch values for Select components (they need controlled state)
  const priority = watch('priority')
  const taskType = watch('taskType')
  const status = watch('status')
  const assigneeId = watch('assigneeId')

  // Format timestamp to datetime-local format
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp).toISOString().slice(0, 16)
  }

  // Reset or populate form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset({
          description: initialData.description,
          priority: String(initialData.priority),
          taskType: String(initialData.taskType),
          status: String(initialData.status || TASK_STATUS.CREATED),
          startDate: formatDate(initialData.startTime),
          estimateDate: formatDate(initialData.estimateTime),
          assigneeId: initialData.assigneeId ? String(initialData.assigneeId) : '',
          imageUrl: initialData.imageUrls?.[0] || '',
          checkList: initialData.checkList || '',
        })
        setEditedDescription(convertHTMLToEditorJS(initialData.checkList || ''))
      } else {
        reset({
          description: '',
          priority: '2',
          taskType: '1',
          status: String(TASK_STATUS.CREATED),
          startDate: '',
          estimateDate: '',
          assigneeId: '',
          imageUrl: '',
          checkList: '',
        })
        setEditedDescription(convertHTMLToEditorJS(''))
      }
    }
  }, [open, mode, initialData, reset])

  // ESC key to close (disabled when loading)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !isLoading) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange, isLoading])

  const onSubmit = (data: FormValues) => {
    if (!data.description.trim()) return
    if (!data.estimateDate) return

    const estimateTime = new Date(data.estimateDate).getTime()
    const startTime = data.startDate ? new Date(data.startDate).getTime() : undefined

    // Validate: estimateTime must be >= startTime
    if (startTime && estimateTime < startTime) {
      setError('estimateDate', {
        type: 'manual',
        message: 'Thời gian hoàn thành phải sau hoặc bằng thời gian bắt đầu',
      })
      return
    }

    // Clear any previous errors
    clearErrors('estimateDate')

    // Find selected member
    const selectedMember = data.assigneeId
      ? memberTask.find((m: any) => String(m.id) === data.assigneeId)
      : undefined

    onCreate({
      description: data.description.trim(),
      priority: Number(data.priority),
      taskType: Number(data.taskType),
      estimateTime,
      assigneeId: selectedMember ? Number(selectedMember.id) : undefined,
      status: Number(data.status),
      startTime,
      imageUrls: data.imageUrl.trim() ? [data.imageUrl.trim()] : undefined,
      checkList: data.checkList.trim() || undefined,
    })

    // Don't close modal here - let parent handle it after API success
    reset()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={() => !isLoading && onOpenChange(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'edit'
                ? 'Cập nhật thông tin công việc'
                : 'Định nghĩa chi tiết công việc và phân công người thực hiện'}
            </p>
          </div>
          <button
            onClick={() => !isLoading && onOpenChange(false)}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} id="create-task-form">
            {/* Description */}
            <div className="space-y-2 mb-5">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Tên công việc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                {...register('description', { required: 'Tên công việc là bắt buộc' })}
                placeholder="Nhập tên công việc..."
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Priority & Task Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Mức độ ưu tiên <span className="text-red-500">*</span>
                </Label>
                <Select value={priority} onValueChange={(val) => setValue('priority', val)}>
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder={TASK_PRIORITY_LABELS[Number(priority)]} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskType" className="text-sm font-medium text-gray-700">
                  Loại công việc <span className="text-red-500">*</span>
                </Label>
                <Select value={taskType} onValueChange={(val) => setValue('taskType', val)}>
                  <SelectTrigger id="taskType" className="w-full">
                    <SelectValue placeholder={TASK_TYPE_LABELS[Number(taskType)]} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status & Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Trạng thái
                </Label>
                <Select value={status} onValueChange={(val) => setValue('status', val)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(TASK_STATUS.CREATED)}>Đã tạo</SelectItem>
                    <SelectItem value={String(TASK_STATUS.VISIBLE)}>Hiển thị</SelectItem>
                    <SelectItem value={String(TASK_STATUS.PENDING)}>Chờ xử lý</SelectItem>
                    <SelectItem value={String(TASK_STATUS.IN_PROGRESS)}>Đang thực hiện</SelectItem>
                    <SelectItem value={String(TASK_STATUS.COMPLETED)}>Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  Thời gian bắt đầu (tùy chọn)
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className="w-full"
                />
              </div>
            </div>

            {/* Estimate Time & Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label
                  htmlFor="estimateDate"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  Thời gian dự kiến hoàn thành <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="estimateDate"
                  type="datetime-local"
                  {...register('estimateDate', { required: 'Thời gian hoàn thành là bắt buộc' })}
                  className="w-full"
                />
                {errors.estimateDate && (
                  <p className="text-sm text-red-500">{errors.estimateDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                  Người thực hiện
                </Label>
                <Select
                  value={assigneeId || 'unassigned'}
                  onValueChange={(val) => setValue('assigneeId', val === 'unassigned' ? '' : val)}
                >
                  <SelectTrigger id="assignee" className="w-full">
                    <SelectValue placeholder="Chưa phân công" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Chưa phân công</SelectItem>
                    {Array.isArray(memberTask) &&
                      memberTask
                        .filter((member) => member && member.id != null && member.id !== '')
                        .map((member) => (
                          <SelectItem key={String(member.id)} value={String(member.id)}>
                            {String(member.name || member.email || 'Unknown')}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2 mb-5">
              <Label
                htmlFor="imageUrl"
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                URL hình ảnh (tùy chọn)
              </Label>
              <Input
                className="hidden"
                id="imageUrl"
                type="url"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
              />
              <FileUploadValidationDemo />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <Label
                htmlFor="checkList"
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                <ListChecks className="w-4 h-4" />
                Mô tả chi tiết (tùy chọn)
              </Label>
              <div className="border border-gray-200 rounded-md p-2">
                <EditorJSComponent
                  data={editedDescription}
                  onChange={(value) => setValue('checkList', convertEditorJSToHTML(value))}
                  placeholder="Nhập mô tả chi tiết công việc..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
            className="min-w-[100px]"
            type="button"
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-task-form"
            className="min-w-[100px] bg-slate-900 hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading ? 'Đang lưu...' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo công việc'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskModal
