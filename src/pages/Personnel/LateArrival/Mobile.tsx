import { SegmentedControl } from '@/components/base/SegmentedControl'
import { Button } from '@/components/ui/button'
import { Plus, Clock } from 'lucide-react'
import { useLeaves } from '@/hooks/leaves/useLeaves.ts'
import StatisticsCardsMobile from '@/components/Leaves/StatisticsCardsMobile'
import LateArrivalDetailSheetMobile from '@/components/Leaves/LateArrivalDetailSheetMobile.tsx'
import CreateLateArrivalSheetMobile from '@/components/Leaves/CreateLateArrivalSheetMobile.tsx'
import useGetLeavesList from '@/hooks/leaves/useGetLeavesList.ts'
import LeaveListItemMobile from '@/components/Leaves/LeaveListItemMobile.tsx'
import LeaveListItemMobileSkeleton from '@/components/Leaves/LeaveListItemMobileSkeleton.tsx'
import {
  type LeavesStatus,
  StatusLeaves,
  type LeavesListDataResponse,
  type LeaveFormValues,
  LeavesType,
} from '@/types/Leave.ts'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRemoveLeaves } from '@/hooks/leaves/useRemoveLeaves'
import ConfirmationSheetMobile from '@/components/base/ConfirmationSheetMobile.tsx'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSearchParams } from 'react-router-dom'
import useGetLeaveDetail from '@/hooks/leaves/useGetLeaveDetail'

export default function LateArrivalMobile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const absenceRequestIdParam = searchParams.get('absenceRequestId')
  const absenceRequestId = absenceRequestIdParam ? Number(absenceRequestIdParam) : null

  const {
    canApprove,
    selectedRequest,
    viewDialogOpen,
    setViewDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen,
    actionType,
    filterStatus,
    setFilterStatus,
    handleActionClick,
    confirmAction,
    isUpdatingStatus,
    setSelectedRequest,
  } = useLeaves()

  const [offset, setOffset] = useState(0)
  const [allItems, setAllItems] = useState<LeavesListDataResponse[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'update'>('create')
  const [editLeaveId, setEditLeaveId] = useState<number | undefined>(undefined)
  const [editInitialValues, setEditInitialValues] = useState<Partial<LeaveFormValues> | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteRequest, setDeleteRequest] = useState<LeavesListDataResponse | null>(null)
  const [detailRequestId, setDetailRequestId] = useState<number | null>(null)
  const [lateArrivalSheetOpen, setLateArrivalSheetOpen] = useState(false)
  const limit = 10

  const { removeLeavesMutate, isRemovingLeave } = useRemoveLeaves()
  const { user } = useAuthStore()

  // Track if sheet was opened from URL param to prevent reopening
  const hasOpenedFromUrlRef = useRef<number | null>(null)

  // Fetch absence request by ID if provided in URL
  const { absenceRequest: absenceRequestFromUrl, isFetching: isFetchingDetailFromUrl } =
    useGetLeaveDetail(absenceRequestId)

  // Fetch detail when detailRequestId is set (from viewDetails or other actions)
  const { absenceRequest: detailRequest, isFetching: isFetchingDetail } =
    useGetLeaveDetail(detailRequestId)

  // Auto-open sheet when absence request is loaded from URL
  useEffect(() => {
    if (
      absenceRequestId &&
      absenceRequestFromUrl &&
      hasOpenedFromUrlRef.current !== absenceRequestId &&
      absenceRequestFromUrl.absenceType === LeavesType.LATE_ARRIVAL
    ) {
      setSelectedRequest(absenceRequestFromUrl)
      setViewDialogOpen(true)
      hasOpenedFromUrlRef.current = absenceRequestId
    }
  }, [absenceRequestFromUrl, absenceRequestId, setSelectedRequest, setViewDialogOpen])

  // Update selectedRequest when detail is fetched
  useEffect(() => {
    if (detailRequest && detailRequest.absenceType === LeavesType.LATE_ARRIVAL) {
      setSelectedRequest(detailRequest)
    }
  }, [detailRequest])

  // Reset ref when absenceRequestId is cleared
  useEffect(() => {
    if (!absenceRequestId) {
      hasOpenedFromUrlRef.current = null
    }
  }, [absenceRequestId])

  // Clear URL param when sheet is closed
  const handleViewSheetChange = (open: boolean) => {
    setViewDialogOpen(open)
    if (!open) {
      if (absenceRequestId) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('absenceRequestId')
        setSearchParams(newSearchParams, { replace: true })
      }
      setDetailRequestId(null)
      setSelectedRequest(null)
    }
  }

  const canEditOrDelete = useCallback(
    (request: LeavesListDataResponse): boolean => {
      return !!(user?.email && request.creator?.email && user.email === request.creator.email)
    },
    [user?.email]
  )

  const { absenceRequests, isFetching, statusCounts } = useGetLeavesList({
    statuses: filterStatus,
    // Chỉ lấy danh sách đơn đi muộn từ backend
    absenceTypes: [LeavesType.LATE_ARRIVAL],
    offset,
    limit,
  })

  // Filter only late arrival requests
  const lateArrivalRequests = useMemo(() => {
    return absenceRequests?.filter((req) => req.absenceType === LeavesType.LATE_ARRIVAL) || []
  }, [absenceRequests])

  const prevAbsenceRequestsRef = useRef<LeavesListDataResponse[]>([])
  const prevOffsetRef = useRef<number>(offset)
  const prevFilterStatusRef = useRef<LeavesStatus[]>(filterStatus)
  const prevIsUpdatingStatusRef = useRef<boolean>(isUpdatingStatus)

  useEffect(() => {
    const filterStatusChanged =
      JSON.stringify(filterStatus) !== JSON.stringify(prevFilterStatusRef.current)
    if (filterStatusChanged) {
      setOffset(0)
      setAllItems([])
      setHasMore(false)
      prevAbsenceRequestsRef.current = []
      prevOffsetRef.current = 0
      prevFilterStatusRef.current = filterStatus
    }
  }, [filterStatus])

  // Reset offset when status update completes
  useEffect(() => {
    if (prevIsUpdatingStatusRef.current && !isUpdatingStatus) {
      setOffset(0)
      prevOffsetRef.current = 0
      setAllItems([])
    }
    prevIsUpdatingStatusRef.current = isUpdatingStatus
  }, [isUpdatingStatus])

  useEffect(() => {
    const offsetChanged = offset !== prevOffsetRef.current
    const dataChanged =
      lateArrivalRequests.length !== prevAbsenceRequestsRef.current.length ||
      (lateArrivalRequests.length > 0 &&
        prevAbsenceRequestsRef.current.length > 0 &&
        (lateArrivalRequests[0]?.id !== prevAbsenceRequestsRef.current[0]?.id ||
          lateArrivalRequests.some((item, index) => {
            const prevItem = prevAbsenceRequestsRef.current[index]
            if (!prevItem) return true
            return (
              prevItem.id !== item.id ||
              prevItem.status !== item.status ||
              prevItem.reason !== item.reason ||
              prevItem.offFrom !== item.offFrom ||
              prevItem.offTo !== item.offTo
            )
          })))

    if (offsetChanged || dataChanged) {
      if (lateArrivalRequests && lateArrivalRequests.length > 0) {
        if (offset === 0) {
          setAllItems(lateArrivalRequests)
        } else {
          setAllItems((prev) => {
            const existingIds = new Set(prev.map((item) => item.id))
            const newItems = lateArrivalRequests.filter((item) => !existingIds.has(item.id))
            return newItems.length > 0 ? [...prev, ...newItems] : prev
          })
        }
        setHasMore(lateArrivalRequests.length === limit)
      } else if (offset === 0) {
        setAllItems([])
        setHasMore(false)
      }

      prevAbsenceRequestsRef.current = lateArrivalRequests
      prevOffsetRef.current = offset
    }
  }, [lateArrivalRequests, offset, limit])

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  const handleEditLeave = (request: LeavesListDataResponse) => {
    if (!canEditOrDelete(request)) return
    setEditMode('update')
    setEditLeaveId(request.id)
    setEditInitialValues({
      absenceType: request.absenceType,
      dayOffType: request.dayOffType,
      offFrom: request.offFrom,
      offTo: request.offTo,
      reason: request.reason,
    })
    setLateArrivalSheetOpen(true)
  }

  const handleCreateClick = () => {
    setEditMode('create')
    setEditLeaveId(undefined)
    setEditInitialValues(null)
    setLateArrivalSheetOpen(true)
  }

  const handleSheetClose = (open: boolean) => {
    setLateArrivalSheetOpen(open)
    if (!open) {
      setEditMode('create')
      setEditLeaveId(undefined)
      setEditInitialValues(null)
    }
  }

  const handleCreateOrUpdateSuccess = () => {
    setOffset(0)
    prevOffsetRef.current = 0
    setAllItems([])
  }

  const handleDeleteLeave = (request: LeavesListDataResponse) => {
    if (isRemovingLeave || !canEditOrDelete(request)) return
    setDeleteRequest(request)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteLeave = () => {
    if (!deleteRequest?.id || isRemovingLeave) return

    removeLeavesMutate(
      {
        absenceRequestId: deleteRequest.id,
      },
      {
        onSuccess: () => {
          setViewDialogOpen(false)
          setDeleteDialogOpen(false)
          setDeleteRequest(null)
        },
        onError: () => {
          setDeleteDialogOpen(false)
        },
      }
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Statistics Cards */}
      <div className="px-4 mt-3">
        <StatisticsCardsMobile pending={statusCounts?.pending} approved={statusCounts?.approved} />
      </div>

      {/* Segmented Control */}
      <div className="pb-3 px-4 mt-4">
        <SegmentedControl
          options={[
            {
              label: 'Tất cả',
              value: [StatusLeaves.APPROVED, StatusLeaves.PENDING, StatusLeaves.REJECTED],
            },
            { label: 'Chờ duyệt', value: [StatusLeaves.PENDING] },
            { label: 'Đã duyệt', value: [StatusLeaves.APPROVED] },
          ]}
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as LeavesStatus[])}
        />
      </div>

      {/* List - giống UI lịch nghỉ */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Loading skeleton khi chưa có dữ liệu */}
        {isFetching && allItems.length === 0 && (
          <div className="px-4 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <LeaveListItemMobileSkeleton key={`late-arrival-skeleton-${index}`} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isFetching && allItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Clock className="size-10 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Chưa có đơn đi muộn
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Đăng ký đơn đi muộn để bắt đầu
            </p>
            <Button onClick={handleCreateClick} className="h-8 px-4 pb-2 rounded-full">
              <Plus className="size-4 mr-1" /> Nộp đơn xin đi muộn
            </Button>
          </div>
        )}

        {/* Danh sách item giống lịch nghỉ */}
        {allItems.length > 0 && (
          <div className="px-4 space-y-2">
            {allItems.map((request) => (
              <LeaveListItemMobile
                key={request.id}
                request={request}
                canApprove={canApprove as boolean}
                onViewDetails={(req) => {
                  setSelectedRequest(req)
                  setDetailRequestId(req.id)
                  setViewDialogOpen(true)
                }}
                onActionClick={handleActionClick}
              />
            ))}

            {/* Skeleton khi load thêm */}
            {isFetching && allItems.length > 0 && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <LeaveListItemMobileSkeleton key={`late-arrival-skeleton-more-${index}`} />
                ))}
              </>
            )}

            {/* Load More */}
            {hasMore && !isFetching && (
              <div className="py-4">
                <Button variant="outline" onClick={handleLoadMore} className="w-full rounded-xl">
                  Tải thêm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA - pill style (above bottom nav) */}
      {!(lateArrivalSheetOpen || viewDialogOpen || confirmDialogOpen || deleteDialogOpen) && (
        <div
          className="fixed inset-x-0 z-[60] bg-transparent bottom-22"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 flex gap-2">
            <Button
              onClick={handleCreateClick}
              className="flex-1 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="size-4 mr-1" />
              Nộp đơn xin đi muộn
            </Button>
          </div>
        </div>
      )}
      <LateArrivalDetailSheetMobile
        open={viewDialogOpen}
        onOpenChange={handleViewSheetChange}
        selectedRequest={selectedRequest || absenceRequestFromUrl}
        isLoading={isFetchingDetail || isFetchingDetailFromUrl}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        canEditOrDelete={canEditOrDelete}
        canApprove={canApprove as boolean}
        onActionClick={handleActionClick}
      />
      {actionType && (
        <ConfirmationSheetMobile
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onConfirm={confirmAction}
          title={actionType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
          description={
            actionType === 'approve'
              ? 'Xác nhận duyệt đơn đi muộn này'
              : 'Xác nhận từ chối đơn đi muộn này'
          }
          message={
            actionType === 'approve'
              ? 'Bạn có chắc chắn muốn duyệt đơn đi muộn này không?'
              : 'Bạn có chắc chắn muốn từ chối đơn đi muộn này không?'
          }
          confirmText={actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
          cancelText="Hủy"
          icon={
            actionType === 'approve' ? (
              <CheckCircle className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )
          }
          variant={actionType === 'approve' ? 'success' : 'danger'}
          isLoading={isUpdatingStatus}
          loadingText={actionType === 'approve' ? 'Đang duyệt...' : 'Đang từ chối...'}
        />
      )}
      <CreateLateArrivalSheetMobile
        open={lateArrivalSheetOpen}
        onOpenChange={handleSheetClose}
        mode={editMode}
        leaveId={editLeaveId}
        initialValues={editInitialValues}
        onSuccess={handleCreateOrUpdateSuccess}
      />
      <ConfirmationSheetMobile
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteLeave}
        title="Xác nhận xoá đơn đi muộn"
        description="Thông tin chi tiết về đơn đi muộn"
        message="Bạn có chắc chắn muốn xoá đơn đi muộn này không? Hành động này không thể hoàn tác."
        confirmText="Xác nhận xoá"
        cancelText="Hủy"
        icon={<Trash2 className="size-5" />}
        variant="danger"
        isLoading={isRemovingLeave}
        loadingText="Đang xoá..."
      />
    </div>
  )
}
