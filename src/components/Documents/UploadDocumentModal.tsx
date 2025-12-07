import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUploadFile } from '@/hooks/useUploadFile'
import { useUploadDocument } from '@/hooks/documents/useDocument'
import { PrivacyLevel } from '@/types/Document'
import { Loader2, Upload, FileIcon } from 'lucide-react'
import { toast } from 'sonner'

const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  privacyLevel: z.nativeEnum(PrivacyLevel),
})

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>

interface UploadDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UploadDocumentModal = ({ open, onOpenChange }: UploadDocumentModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFileMutation = useUploadFile()
  const uploadDocumentMutation = useUploadDocument()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: '',
      privacyLevel: PrivacyLevel.PRIVATE,
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng file phải nhỏ hơn 10MB')
      return
    }

    setSelectedFile(file)
  }

  const onSubmit = async (data: UploadDocumentFormData) => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file')
      return
    }

    setIsUploading(true)

    try {
      // Step 1: Upload file
      const uploadResponse = await uploadFileMutation.mutateAsync(selectedFile)

      // Step 2: Create document
      await uploadDocumentMutation.mutateAsync({
        title: data.title,
        fileUrl: uploadResponse.viewUrl,
        sizeBytes: selectedFile.size,
        contentType: selectedFile.type,
        privacyLevel: data.privacyLevel,
        viewableUserIds: [], // Can be extended to select users
      })

      // Success - close modal and reset
      onOpenChange(false)
      reset()
      setSelectedFile(null)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false)
      reset()
      setSelectedFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* File Picker */}
          <div className="space-y-2">
            <Label>File</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Chọn file'}
              </Button>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileIcon className="w-4 h-4" />
                <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Nhập tiêu đề tài liệu..."
                    disabled={isUploading}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Privacy Level */}
          <div className="space-y-2">
            <Label>Mức độ riêng tư</Label>
            <Controller
              control={control}
              name="privacyLevel"
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={isUploading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PrivacyLevel.PRIVATE.toString()} id="private" />
                    <Label htmlFor="private" className="font-normal cursor-pointer">
                      Riêng tư (chỉ bạn xem được)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PrivacyLevel.PUBLIC.toString()} id="public" />
                    <Label htmlFor="public" className="font-normal cursor-pointer">
                      Công khai (mọi người xem được)
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                'Tải lên'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
