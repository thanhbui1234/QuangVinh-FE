import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useUpdateColection } from '@/hooks/colection/useUpdateColection'
import { useDeleteColection } from '@/hooks/colection/useDeleteColection'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  desc: z.string().optional(),
  status: z.coerce.number().min(1),
})

type FormData = z.infer<typeof formSchema & { collectionId: number }>

interface CollectionSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: any
}

export const CollectionSettingsModal: React.FC<CollectionSettingsModalProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const hasNavigate = true
  const { updateColectionMutation } = useUpdateColection(initialData?.id)
  const { deleteColectionMutation } = useDeleteColection(hasNavigate)

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

  const [activeTab, setActiveTab] = React.useState('general')

  useEffect(() => {
    if (open && initialData) {
      reset({
        name: initialData.name,
        desc: initialData.description || initialData.desc || '',
        status: initialData.status,
      })
    }
  }, [open, initialData, reset])

  const onUpdate = (values: FormData) => {
    updateColectionMutation.mutate(
      {
        collectionId: initialData.id,
        ...values,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const onDelete = () => {
    deleteColectionMutation.mutate(initialData?.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cài đặt bộ sưu tập</DialogTitle>
          <DialogDescription>Quản lý thông tin và thiết lập cho bộ sưu tập này.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="danger">Xoá bộ sưu tập</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 py-4">
            <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
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

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={updateColectionMutation.isPending}>
                  {updateColectionMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cảnh báo</AlertTitle>
              <AlertDescription>
                Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn bộ sưu tập và xóa dữ
                liệu khỏi máy chủ của chúng tôi.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={deleteColectionMutation.isPending}
              >
                {deleteColectionMutation.isPending ? 'Đang xóa...' : 'Xóa bộ sưu tập'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
