'use client'

import { Upload, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { useUploadFile } from '@/hooks/useUploadFile'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'

interface FileUploadValidationDemoProps {
  onUploadSuccess?: (url: string) => void
  initialImages?: string[]
  onRemove?: (url: string) => void
}

export function FileUploadValidationDemo({
  onUploadSuccess,
  initialImages = [],
  onRemove,
}: FileUploadValidationDemoProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [existingImages, setExistingImages] = React.useState<string[]>([])
  const uploadFileMutation = useUploadFile()
  const uploadedFilesRef = React.useRef<Set<string>>(new Set())
  console.log('📸 Initial images:', initialImages)
  // Sync initialImages to state
  React.useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setExistingImages(initialImages)
    }
  }, [initialImages])

  const handleRemoveExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url))
    onRemove?.(url)
  }

  const onFileValidate = React.useCallback(
    (file: File): string | null => {
      // Validate max files (including existing ones)
      if (files.length + existingImages.length >= 3) {
        return 'Chỉ được upload 1 file'
      }

      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        return 'Chỉ chấp nhận file ảnh'
      }

      // Validate file size (max 2MB)
      const MAX_SIZE = 5 * 1024 * 1024 // 2MB
      if (file.size > MAX_SIZE) {
        return `Dung lượng file phải nhỏ hơn ${MAX_SIZE / (1024 * 1024)}MB`
      }

      return null
    },
    [files, existingImages]
  )

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" bị từ chối`,
    })
  }, [])

  // Upload file when files change
  React.useEffect(() => {
    if (files.length > 0 && !uploadFileMutation.isPending) {
      const file = files[0]
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`

      // Skip if already uploaded
      if (uploadedFilesRef.current.has(fileKey)) {
        return
      }

      // Mark as uploading
      uploadedFilesRef.current.add(fileKey)

      uploadFileMutation.mutate(file, {
        onSuccess: (response) => {
          const viewUrl = response.viewUrl
          console.log('✅ Uploaded URL:', viewUrl)

          // Callback to parent with URL
          onUploadSuccess?.(viewUrl)

          toast.success('Upload thành công!', {
            description: file.name,
          })
        },
        onError: (error) => {
          // Remove from uploaded set on error so can retry
          uploadedFilesRef.current.delete(fileKey)

          toast.error('Upload thất bại', {
            description: error.message,
          })
          setFiles([])
        },
      })
    }
  }, [files, onUploadSuccess])

  // Custom render function for preview with zoom
  const renderPreviewWithZoom = React.useCallback((file: File, fallback: () => React.ReactNode) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      return (
        <ImageZoom>
          <img
            src={url}
            alt={file.name}
            className="size-full object-cover cursor-zoom-in"
            style={{ maxWidth: '60vw', maxHeight: '60vh' }}
          />
        </ImageZoom>
      )
    }
    return fallback()
  }, [])

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onFileValidate={onFileValidate}
      onFileReject={onFileReject}
      accept="image/*"
      maxFiles={1}
      className="w-full"
      disabled={uploadFileMutation.isPending}
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">
            {uploadFileMutation.isPending ? 'Đang upload...' : 'Kéo thả file vào đây'}
          </p>
          <p className="text-muted-foreground text-xs">Dung lượng tối đa là 2MB</p>
        </div>
        <FileUploadTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            disabled={uploadFileMutation.isPending}
          >
            {uploadFileMutation.isPending ? 'Đang tải...' : 'Chọn file'}
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {existingImages.map((url) => (
          <div key={url} className="relative flex items-center gap-2.5 rounded-md border p-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
              <ImageZoom>
                <img
                  src={url}
                  alt="Existing file"
                  className="size-full object-cover cursor-zoom-in"
                  style={{ maxWidth: '60vw', maxHeight: '60vh' }}
                />
              </ImageZoom>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-sm">
                {url.split('/').pop() || 'Existing Image'}
              </span>
              <span className="truncate text-muted-foreground text-xs">Already uploaded</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => handleRemoveExisting(url)}
              type="button"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        {files.map((file) => (
          <FileUploadItem key={file.name} value={file}>
            <FileUploadItemPreview render={renderPreviewWithZoom} />
            <FileUploadItemMetadata />
            <FileUploadItemDelete asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={uploadFileMutation.isPending}
              >
                <X />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  )
}
