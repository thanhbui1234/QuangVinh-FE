import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  desc: z.string().optional(),
  status: z.coerce.number().min(1),
})

type FormData = z.infer<typeof formSchema>

interface CollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any | null
  onSubmit: (data: FormData) => void
  isSubmitting?: boolean
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      desc: '',
      status: 1,
    },
  })

  // Watch status to update Select value
  const statusValue = watch('status')

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          desc: initialData.desc,
          status: initialData.status,
        })
      } else {
        reset({
          name: '',
          desc: '',
          status: 1,
        })
      }
    }
  }, [open, initialData, reset])

  const onFormSubmit = (values: FormData) => {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa bộ sưu tập' : 'Tạo bộ sưu tập mới'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin cho bộ sưu tập của bạn.'
              : 'Tạo bộ sưu tập mới để tổ chức các bảng công việc.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên bộ sưu tập</Label>
            <Input id="name" placeholder="Nhập tên..." {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea id="desc" placeholder="Nhập mô tả..." {...register('desc')} />
            {errors.desc && <p className="text-sm text-red-500">{errors.desc.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              onValueChange={(val) => setValue('status', parseInt(val))}
              value={statusValue?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Hoạt động</SelectItem>
                <SelectItem value="2">Không hoạt động</SelectItem>
                <SelectItem value="3">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
