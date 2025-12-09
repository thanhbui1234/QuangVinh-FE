import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'
import { PrivacyBadge, StatusBadge } from '@/components/Documents'
import type { Document } from '@/types/Document'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface DocumentTableProps {
  documents: Document[]
  isLoading?: boolean
  canDelete?: boolean
}

export const DocumentTable = ({ documents, isLoading, canDelete = true }: DocumentTableProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (contentType: string) => {
    if (!contentType) return 'File'
    if (contentType.includes('pdf')) return 'PDF'
    if (contentType.includes('image')) return 'Hình ảnh'
    if (contentType.includes('word') || contentType.includes('document')) return 'Word'
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'Excel'
    if (contentType.includes('video')) return 'Video'
    return 'File'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 mb-2">Chưa có tài liệu nào</p>
        <p className="text-sm text-gray-400">Tải lên tài liệu đầu tiên của bạn</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Người tải lên</TableHead>
              <TableHead>Riêng tư</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.documentId}>
                <TableCell className="font-medium max-w-xs truncate">{doc.title}</TableCell>
                <TableCell>{getFileType(doc.contentType)}</TableCell>
                <TableCell>{formatFileSize(doc.sizeBytes)}</TableCell>
                <TableCell>{doc.uploaderName || `User ${doc.uploaderId}`}</TableCell>
                <TableCell>
                  <PrivacyBadge privacyLevel={doc.privacyLevel} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(doc.createdTime), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      title="Xem"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Tải xuống">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
