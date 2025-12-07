import { Badge } from '@/components/ui/badge'
import { DocumentStatus } from '@/types/Document'

interface StatusBadgeProps {
  status: DocumentStatus
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case DocumentStatus.ACTIVE:
      return (
        <Badge variant="default" className="bg-green-500">
          Hoạt động
        </Badge>
      )
    case DocumentStatus.DISABLED:
      return <Badge variant="secondary">Vô hiệu hóa</Badge>
    case DocumentStatus.DELETED:
      return <Badge variant="destructive">Đã xóa</Badge>
    case DocumentStatus.ARCHIVED:
      return (
        <Badge variant="default" className="bg-blue-500">
          Lưu trữ
        </Badge>
      )
    default:
      return <Badge variant="secondary">Không xác định</Badge>
  }
}
