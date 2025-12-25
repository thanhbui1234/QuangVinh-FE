import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/schemas'
import type { IProject } from '@/types/project'
import { FormSelect } from '../ui/selectDropwdown'
import { STATUS_PROJECT, PRIVACY, PRIVACY_LABEL } from '@/constants/assignments/privacy'

interface AssignmentsModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (data: IProject) => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  initialData?: IProject | null
}

// Convert constants to select options
const statusOptions = [
  { value: STATUS_PROJECT.CREATED, label: 'Mới tạo' },
  { value: STATUS_PROJECT.PENDING, label: 'Chờ xử lý' },
  { value: STATUS_PROJECT.IN_PROGRESS, label: 'Đang thực hiện' },
  { value: STATUS_PROJECT.COMPLETED, label: 'Đã hoàn thành' },
]

const privacyOptions = Object.entries(PRIVACY).map(([key, value]) => ({
  value: value,
  label: PRIVACY_LABEL[key as keyof typeof PRIVACY_LABEL],
}))

export const AssignmentsModal = ({
  open,
  setOpen,
  onSubmit,
  isSubmitting,
  mode = 'create',
  initialData,
}: AssignmentsModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IProject>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      status: 1,
      privacy: 1,
    },
  })

  // Reset form when mode changes or initial data is provided
  React.useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name,
          status: initialData.status,
          privacy: initialData.privacy,
          taskGroupId: initialData.taskGroupId,
        })
      } else {
        reset({
          name: '',
          status: 1,
          privacy: 1,
        })
      }
    }
  }, [open, mode, initialData, reset])

  const handleFormSubmit = (data: IProject) => {
    onSubmit(data)
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {mode === 'edit' ? 'Cài đặt dự án' : 'Tạo dự án mới'}
          </DialogTitle>
        </DialogHeader>

        <form className="p-6 space-y-5" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Tên dự án */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tên dự án</label>
            <Input
              {...register('name')}
              placeholder="Nhập tên dự án..."
              className="h-10 border-gray-200 focus:border-blue-500 hover:border-blue-400 transition-colors"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <FormSelect
                control={control}
                name="status"
                placeholder="Trạng thái"
                options={statusOptions}
                className="w-full"
              />
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quyền riêng tư</label>
              <FormSelect
                control={control}
                name="privacy"
                placeholder="Quyền riêng tư"
                options={privacyOptions}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-5 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={!!isSubmitting}
              className="px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg"
            >
              {isSubmitting
                ? mode === 'edit'
                  ? 'Đang lưu...'
                  : 'Đang tạo...'
                : mode === 'edit'
                  ? 'Lưu thay đổi'
                  : 'Tạo dự án'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AssignmentsModal
