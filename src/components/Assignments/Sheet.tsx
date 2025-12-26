import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/schemas'
import type { IProject } from '@/types/project'
import { FormSelect } from '../ui/selectDropwdown'
import { STATUS_PROJECT, PRIVACY, PRIVACY_LABEL } from '@/constants/assignments/privacy'
import { isMobile } from 'react-device-detect'

interface AssignmentsSheetProps {
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

  { value: STATUS_PROJECT.IN_PROGRESS, label: 'Đang thực hiện' },
  { value: STATUS_PROJECT.COMPLETED, label: 'Đã hoàn thành' },
]

const privacyOptions = Object.entries(PRIVACY).map(([key, value]) => ({
  value: value,
  label: PRIVACY_LABEL[key as keyof typeof PRIVACY_LABEL],
}))
export const AssignmentsSheet = ({
  open,
  setOpen,
  onSubmit,
  isSubmitting,
  mode = 'create',
  initialData,
}: AssignmentsSheetProps) => {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="pb-10" side={isMobile ? 'bottom' : 'right'}>
        <SheetHeader>
          <SheetTitle>{mode === 'edit' ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</SheetTitle>
        </SheetHeader>
        <form className="mt-6 space-y-4 mx-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Tên dự án */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên dự án</label>
            <Input {...register('name')} placeholder="Nhập tên dự án" />
          </div>
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <FormSelect
              control={control}
              name="status"
              placeholder="Chọn trạng thái"
              options={statusOptions}
              className="w-full"
            />
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quyền riêng tư</label>
            <FormSelect
              control={control}
              name="privacy"
              placeholder="Chọn quyền riêng tư"
              options={privacyOptions}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 px-2 w-full">
            <Button className="w-1/2" type="button" variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button className="w-1/2" type="submit" disabled={!!isSubmitting}>
              {isSubmitting
                ? mode === 'edit'
                  ? 'Đang cập nhật...'
                  : 'Đang tạo...'
                : mode === 'edit'
                  ? 'Cập nhật'
                  : 'Tạo'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default AssignmentsSheet
