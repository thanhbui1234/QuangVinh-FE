import { Button } from '@/components/ui/button.tsx'
import { Calendar, Plus } from 'lucide-react'
import { type LeavesListDataResponse } from '@/types/Leave.ts'
import LeaveListItemMobile from './LeaveListItemMobile.tsx'
import LeaveListItemMobileSkeleton from './LeaveListItemMobileSkeleton.tsx'

type LeaveListMobileProps = {
  items: LeavesListDataResponse[]
  canApprove: boolean
  onViewDetails: (request: LeavesListDataResponse) => void
  onActionClick: (id: number, action: 'approve' | 'reject', request: LeavesListDataResponse) => void
  onCreateClick: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export default function LeaveListMobile({
  items,
  canApprove,
  onViewDetails,
  onActionClick,
  onCreateClick,
  onLoadMore,
  hasMore,
  isLoading,
}: LeaveListMobileProps) {
  if (items.length === 0 && isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <LeaveListItemMobileSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Calendar className="size-10 text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
          Chưa có đơn nghỉ phép
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tạo đơn mới để bắt đầu</p>
        <Button onClick={onCreateClick} className="h-8 px-4 pb-2">
          <Plus className="size-4 mr-1" /> Tạo đơn xin nghỉ
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((request) => (
        <div key={request.id}>
          <LeaveListItemMobile
            request={request}
            canApprove={canApprove}
            onViewDetails={onViewDetails}
            onActionClick={onActionClick}
          />
        </div>
      ))}

      {/* Show skeleton items when loading more */}
      {isLoading && items.length > 0 && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <LeaveListItemMobileSkeleton key={`skeleton-more-${index}`} />
          ))}
        </>
      )}

      {hasMore && onLoadMore && !isLoading && (
        <div className="flex justify-center py-4">
          <Button onClick={onLoadMore} variant="outline">
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  )
}
