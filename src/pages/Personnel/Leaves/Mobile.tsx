import { SegmentedControl } from '@/components/base/SegmentedControl'
import { BottomCTA } from '@/components/base/BottomCTA'
import { Plus } from 'lucide-react'
import { useLeaves } from '@/hooks/leaves/useLeaves.ts'
import StatisticsCardsMobile from '@/components/Leaves/StatisticsCardsMobile.tsx'
import LeaveListMobile from '@/components/Leaves/LeaveListMobile.tsx'
import ViewDetailsSheetMobile from '@/components/Leaves/ViewDetailsSheetMobile.tsx'
import CreateLeaveSheetMobile from '@/components/Leaves/CreateLeaveSheetMobile.tsx'
import useGetLeavesList from '@/hooks/leaves/useGetLeavesList.ts'
import WeeklyCalendarMobile from '@/components/Leaves/WeeklyCalendar/WeeklyCalendarMobile.tsx'
import {
  type LeavesStatus,
  StatusLeaves,
  type LeavesListDataResponse,
  type LeaveFormValues,
} from '@/types/Leave.ts'
import { useState, useEffect, useCallback, useRef } from 'react'
import { convertToDateInput } from '@/utils/CommonUtils.ts'
import { useRemoveLeaves } from '@/hooks/leaves/useRemoveLeaves'
import ConfirmationSheetMobile from '@/components/base/ConfirmationSheetMobile.tsx'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSearchParams } from 'react-router-dom'
import useGetLeaveDetail from '@/hooks/leaves/useGetLeaveDetail'

export default function LeavesMobile() {
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
    createDialogOpen,
    setCreateDialogOpen,
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
  // Only depends on absenceRequestId and absenceRequestFromUrl, not viewDialogOpen
  // This prevents reopening when sheet is closed
  useEffect(() => {
    // Only open if:
    // 1. absenceRequestId exists (URL param is present)
    // 2. absenceRequestFromUrl is loaded
    // 3. We haven't opened this specific request yet
    if (
      absenceRequestId &&
      absenceRequestFromUrl &&
      hasOpenedFromUrlRef.current !== absenceRequestId
    ) {
      setSelectedRequest(absenceRequestFromUrl)
      setViewDialogOpen(true)
      hasOpenedFromUrlRef.current = absenceRequestId
    }
  }, [absenceRequestFromUrl, absenceRequestId, setSelectedRequest, setViewDialogOpen])

  // Update selectedRequest when detail is fetched
  useEffect(() => {
    if (detailRequest) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.log('LeavesMobile - detailRequest received:', detailRequest)
      }
      setSelectedRequest(detailRequest)
    }
  }, [detailRequest])

  // Reset ref when absenceRequestId is cleared (URL param removed)
  useEffect(() => {
    if (!absenceRequestId) {
      // URL param was cleared, reset the ref to allow opening again if new param is added
      hasOpenedFromUrlRef.current = null
    }
  }, [absenceRequestId])

  // Clear URL param when sheet is closed
  const handleViewSheetChange = (open: boolean) => {
    setViewDialogOpen(open)
    if (!open) {
      // Remove query param when closing
      if (absenceRequestId) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('absenceRequestId')
        setSearchParams(newSearchParams, { replace: true })
      }
      // Clear detail request ID
      setDetailRequestId(null)
      setSelectedRequest(null)
    }
  }

  // Check if current user is the creator of the leave request
  const canEditOrDelete = useCallback(
    (request: LeavesListDataResponse) => {
      return user?.email && request.creator?.email && user.email === request.creator.email
    },
    [user?.email]
  )

  const { absenceRequests, isFetching, statusCounts } = useGetLeavesList({
    statuses: filterStatus,
    offset,
    limit,
  })

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
    // When isUpdatingStatus changes from true to false, mutation completed
    // Note: invalidateQueries in useUpdateLeavesStatus will automatically trigger refetch
    if (prevIsUpdatingStatusRef.current && !isUpdatingStatus) {
      // Reset to first page to get updated list
      setOffset(0)
      prevOffsetRef.current = 0
      setAllItems([])
    }
    prevIsUpdatingStatusRef.current = isUpdatingStatus
  }, [isUpdatingStatus])

  useEffect(() => {
    const offsetChanged = offset !== prevOffsetRef.current
    // More comprehensive data change detection
    const dataChanged =
      absenceRequests.length !== prevAbsenceRequestsRef.current.length ||
      (absenceRequests.length > 0 &&
        prevAbsenceRequestsRef.current.length > 0 &&
        (absenceRequests[0]?.id !== prevAbsenceRequestsRef.current[0]?.id ||
          absenceRequests.some((item, index) => {
            const prevItem = prevAbsenceRequestsRef.current[index]
            if (!prevItem) return true
            // Check if any field has changed (not just ID and status)
            return (
              prevItem.id !== item.id ||
              prevItem.status !== item.status ||
              prevItem.reason !== item.reason ||
              prevItem.offFrom !== item.offFrom ||
              prevItem.offTo !== item.offTo ||
              prevItem.absenceType !== item.absenceType ||
              prevItem.dayOffType !== item.dayOffType
            )
          })))

    if (offsetChanged || dataChanged) {
      if (absenceRequests && absenceRequests.length > 0) {
        if (offset === 0) {
          setAllItems(absenceRequests)
        } else {
          setAllItems((prev) => {
            // Avoid duplicate items
            const existingIds = new Set(prev.map((item) => item.id))
            const newItems = absenceRequests.filter((item) => !existingIds.has(item.id))
            return newItems.length > 0 ? [...prev, ...newItems] : prev
          })
        }
        setHasMore(absenceRequests.length === limit)
      } else if (offset === 0) {
        setAllItems([])
        setHasMore(false)
      }

      prevAbsenceRequestsRef.current = absenceRequests
      prevOffsetRef.current = offset
    }
  }, [absenceRequests, offset, limit])

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
      offFrom: convertToDateInput(request.offFrom),
      offTo: convertToDateInput(request.offTo),
      reason: request.reason,
    })
    setCreateDialogOpen(true)
  }

  const handleCreateClick = () => {
    setEditMode('create')
    setEditLeaveId(undefined)
    setEditInitialValues(null)
    setCreateDialogOpen(true)
  }

  const handleSheetClose = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setEditMode('create')
      setEditLeaveId(undefined)
      setEditInitialValues(null)
    }
  }

  const handleCreateOrUpdateSuccess = () => {
    // Reset to first page to get updated list
    // Note: invalidateQueries in useUpdateLeaves will automatically trigger refetch
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
    <div className="flex flex-col min-h-screen dark:bg-gray-950">
      <StatisticsCardsMobile pending={statusCounts?.pending} approved={statusCounts?.approved} />
      <div className="pb-4">
        <WeeklyCalendarMobile className="mb-4" />
      </div>
      <div className="pb-2">
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
      {/* iOS-style List */}
      <div className="flex-1 overflow-y-auto pb-28">
        <LeaveListMobile
          items={allItems}
          canApprove={canApprove as boolean}
          onViewDetails={(request) => {
            if (import.meta.env.NODE_ENV === 'development') {
              console.log('LeavesMobile - onViewDetails called with request:', request)
            }
            // Set selectedRequest from list first (for immediate display)
            setSelectedRequest(request)
            // Then fetch detail using the detail API to get latest data
            setDetailRequestId(request.id)
            setViewDialogOpen(true)
          }}
          onActionClick={handleActionClick}
          onCreateClick={handleCreateClick}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isFetching}
        />
      </div>
      {/* Fixed Bottom CTA - pill style (above bottom nav) */}
      <BottomCTA
        visible={!(createDialogOpen || viewDialogOpen || confirmDialogOpen)}
        onClick={handleCreateClick}
        label="Tạo đơn xin nghỉ"
        icon={<Plus className="size-4" />}
        bottomOffsetClassName="bottom-22"
      />
      <ViewDetailsSheetMobile
        open={viewDialogOpen}
        onOpenChange={handleViewSheetChange}
        selectedRequest={selectedRequest || absenceRequestFromUrl}
        isLoading={isFetchingDetail || isFetchingDetailFromUrl}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        canEditOrDelete={canEditOrDelete}
      />
      {actionType && (
        <ConfirmationSheetMobile
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          onConfirm={confirmAction}
          title={actionType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
          description={
            actionType === 'approve'
              ? 'Xác nhận duyệt đơn xin nghỉ này'
              : 'Xác nhận từ chối đơn xin nghỉ này'
          }
          message={
            actionType === 'approve'
              ? 'Bạn có chắc chắn muốn duyệt đơn xin nghỉ này không?'
              : 'Bạn có chắc chắn muốn từ chối đơn xin nghỉ này không?'
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
      <CreateLeaveSheetMobile
        open={createDialogOpen}
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
        title="Xác nhận xoá đơn nghỉ"
        description="Thông tin chi tiết về đơn xin nghỉ"
        message="Bạn có chắc chắn muốn xoá đơn xin nghỉ này không? Hành động này không thể hoàn tác."
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
