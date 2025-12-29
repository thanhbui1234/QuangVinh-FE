// DocumentsMy.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUploadFile } from '@/hooks/useUploadFile'
import { useUploadDocument } from '@/hooks/documents/useDocument'
import { Loader2, Upload, FileIcon, X, Users, Lock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useGetAllUser } from '@/hooks/assignments/useGetAllUser'
import { allowedTypes } from '@/constants/file'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

const DocumentStatus = {
  ACTIVE: 0,
  DISABLED: 1,
  ARCHIVED: 3,
} as const

const PrivacyLevel = {
  PRIVATE: 0,
  PUBLIC: 1,
} as const

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề tài liệu'),
  status: z.nativeEnum(DocumentStatus),
  privacyLevel: z.nativeEnum(PrivacyLevel),
  viewableUserIds: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

const DocumentsMy = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { allUser } = useGetAllUser()
  const uploadFileMutation = useUploadFile()
  const uploadDocumentMutation = useUploadDocument()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      status: DocumentStatus.ACTIVE,
      privacyLevel: PrivacyLevel.PRIVATE,
      viewableUserIds: [],
    },
  })

  const privacyLevel = watch('privacyLevel')
  const viewableUserIds = watch('viewableUserIds') || []
  // Tự động điền title từ tên file
  useEffect(() => {
    if (selectedFile && !watch('title')) {
      setValue('title', selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }, [selectedFile, setValue, watch])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File không được lớn hơn 10MB')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('File chỉ được sử dụng định dạng PDF và hình ảnh')
      return
    }

    setSelectedFile(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file')
      return
    }

    setIsUploading(true)

    try {
      const uploadRes = await uploadFileMutation.mutateAsync(selectedFile)
      await uploadDocumentMutation.mutateAsync({
        title: data.title,
        fileUrl: uploadRes.viewUrl,
        sizeBytes: selectedFile.size,
        contentType: selectedFile.type || 'application/octet-stream',
        status: data.status,
        privacyLevel: data.privacyLevel,
        downloadUrl: uploadRes.downloadUrl,
        viewableUserIds:
          data.privacyLevel === PrivacyLevel.PUBLIC
            ? []
            : data.viewableUserIds?.map((id) => Number(id)) || [],
      })

      toast.success('Tải lên tài liệu thành công!')
      reset()
      setSelectedFile(null)
    } catch (err) {
      toast.error('Tải lên thất bại')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    reset()
  }

  return (
    <div className="max-w-4xl mx-auto py-10 overflow-y-hidden px-4">
      <PageBreadcrumb />
      <div className="bg-card rounded-2xl border border-border shadow-lg">
        <div className="px-8 py-6 border-b border-border">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            Tải lên tài liệu mới
          </h2>
          <p className="text-muted-foreground mt-1">
            Điền đầy đủ thông tin và chọn file để tải lên
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* File Upload */}
          <div className="space-y-4">
            <Label>File tài liệu *</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-muted-foreground transition">
                <Upload className="w-5 h- mx-auto text-muted-foreground mb-4" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Chọn file từ máy
                </Button>
                <input id="file-input" type="file" className="hidden" onChange={handleFileSelect} />
                <p className="text-sm text-muted-foreground mt-3">
                  Hỗ trợ PDF, hình ảnh (tối đa 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề tài liệu *</Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input {...field} id="title" placeholder="VD: Báo cáo tài chính Q4 2025" />
                )}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value.toString()}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Đang hoạt động</SelectItem>
                      <SelectItem value="1">Đã vô hiệu hóa</SelectItem>
                      <SelectItem value="3">Đã lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Privacy Level */}
          <div className="space-y-4">
            <Label>Mức độ riêng tư</Label>
            <Controller
              control={control}
              name="privacyLevel"
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <div className="flex items-center space-x-3 p-4 rounded-lg border bg-gray-50">
                    <RadioGroupItem value="0" id="private" />
                    <Label
                      htmlFor="private"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Riêng tư</p>
                        <p className="text-sm text-muted-foreground">
                          Chỉ bạn và người được chọn mới xem được
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border bg-gray-50">
                    <RadioGroupItem value="1" id="public" />
                    <Label
                      htmlFor="public"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Công khai</p>
                        <p className="text-sm text-muted-foreground">
                          Tất cả thành viên trong công ty đều xem được
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Viewable Users - chỉ hiện khi PRIVATE */}
          {privacyLevel === PrivacyLevel.PRIVATE && (
            <div className="space-y-3 p-5 border rounded-xl bg-muted">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="w-5 h-5" />
                Người được phép xem (tùy chọn)
              </div>
              <Controller
                control={control}
                name="viewableUserIds"
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="max-h-60 overflow-y-auto border rounded-lg bg-card">
                      {allUser && allUser.length > 0 ? (
                        allUser.map((user) => {
                          const isSelected = field.value?.includes(user.id.toString())

                          return (
                            <label
                              key={user.id}
                              className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const current = field.value || []
                                  if (e.target.checked) {
                                    field.onChange([...current, user.id.toString()])
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== user.id.toString())
                                    )
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </label>
                          )
                        })
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Không có người dùng nào
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
              {viewableUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {viewableUserIds.map((id) => {
                    const user = allUser?.find((u) => u.id.toString() === id)

                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {user?.name || 'Unknown'}

                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              'viewableUserIds',
                              viewableUserIds.filter((i) => i !== id)
                            )
                          }
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-border">
            <Button type="button" variant="outline" onClick={removeFile} disabled={isUploading}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile} className="min-w-40">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                'Tải lên tài liệu'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentsMy
