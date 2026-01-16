import { Button } from '@/components/ui/button.tsx'
import { Clock, Plus } from 'lucide-react'
import { useLeaves } from '@/hooks/leaves/useLeaves.ts'
import LateArrivalTable from '@/components/Leaves/LateArrivalTable.tsx'
import { AnimatedFilterPills } from '@/components/Leaves/AnimatedFilterPills.tsx'
import StatisticsCards from '@/components/Leaves/StatisticsCards'
import LateArrivalDetailDialog from '@/components/Leaves/LateArrivalDetailDialog.tsx'
import ConfirmationDialog from '@/components/Leaves/ConfirmationDialog.tsx'
import CreateLateArrivalDialog from '@/components/Leaves/CreateLateArrivalDialog.tsx'
import DeleteLeaveDialog from '@/components/Leaves/DeleteLeaveDialog.tsx'
import useGetLeavesList from '@/hooks/leaves/useGetLeavesList.ts'
import {
  type LeavesStatus,
  StatusLeaves,
  type LeavesListDataResponse,
  type LeaveFormValues,
  LeavesType,
} from '@/types/Leave.ts'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRemoveLeaves } from '@/hooks/leaves/useRemoveLeaves'
import { useAuthStore } from '@/stores/authStore'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { useSearchParams } from 'react-router-dom'
import useGetLeaveDetail from '@/hooks/leaves/useGetLeaveDetail'
import { motion } from 'framer-motion'

export default function LateArrivalWeb() {
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [limit, setLimit] = useState(10)
  const [editMode, setEditMode] = useState<'create' | 'update'>('create')
  const [editLeaveId, setEditLeaveId] = useState<number | undefined>(undefined)
  const [editInitialValues, setEditInitialValues] = useState<Partial<LeaveFormValues> | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteRequest, setDeleteRequest] = useState<LeavesListDataResponse | null>(null)
  const [detailRequestId, setDetailRequestId] = useState<number | null>(null)
  const [lateArrivalDialogOpen, setLateArrivalDialogOpen] = useState(false)

  const { removeLeavesMutate, isRemovingLeave } = useRemoveLeaves()
  const { user } = useAuthStore()

  // Track if modal was opened from URL param to prevent reopening
  const hasOpenedFromUrlRef = useRef<number | null>(null)

  // Fetch absence request by ID if provided in URL
  const { absenceRequest: absenceRequestFromUrl, isFetching: isFetchingDetailFromUrl } =
    useGetLeaveDetail(absenceRequestId)

  // Fetch detail when detailRequestId is set (from viewDetails or other actions)
  const { absenceRequest: detailRequest, isFetching: isFetchingDetail } =
    useGetLeaveDetail(detailRequestId)

  // Auto-open modal when absence request is loaded from URL
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

  // Clear URL param when modal is closed
  const handleViewDialogChange = (open: boolean) => {
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

  const filterStatusKey = useMemo(() => JSON.stringify([...filterStatus].sort()), [filterStatus])

  // Check if current user is the creator of the leave request
  const canEditOrDelete = useCallback(
    (request: LeavesListDataResponse): boolean => {
      return !!(user?.email && request.creator?.email && user.email === request.creator.email)
    },
    [user?.email]
  )

  const queryParams = useMemo(
    () => ({
      statuses: filterStatus,
      // Chỉ lấy danh sách đơn đi muộn từ backend
      absenceTypes: [LeavesType.LATE_ARRIVAL],
      offset,
      limit,
    }),
    [filterStatusKey, offset, limit]
  )

  const { absenceRequests, isFetching, statusCounts } = useGetLeavesList(queryParams)

  // Filter only late arrival requests
  const lateArrivalRequests = useMemo(() => {
    return absenceRequests?.filter((req) => req.absenceType === LeavesType.LATE_ARRIVAL) || []
  }, [absenceRequests])

  const prevFilterStatusKeyRef = useRef<string>(filterStatusKey)
  const prevAbsenceRequestsIdsRef = useRef<string>('')

  useEffect(() => {
    if (prevFilterStatusKeyRef.current !== filterStatusKey) {
      setOffset(0)
      setAllItems([])
      setLimit(10)
      prevFilterStatusKeyRef.current = filterStatusKey
      prevAbsenceRequestsIdsRef.current = ''
    }
  }, [filterStatusKey])

  useEffect(() => {
    if (!lateArrivalRequests) {
      if (offset === 0 && prevAbsenceRequestsIdsRef.current !== '') {
        setAllItems([])
        prevAbsenceRequestsIdsRef.current = ''
      }
      return
    }

    const currentDataKey = lateArrivalRequests
      .map((item) => `${item.id}:${item.status}`)
      .sort()
      .join(',')

    if (offset === 0) {
      if (currentDataKey !== prevAbsenceRequestsIdsRef.current) {
        setAllItems(lateArrivalRequests)
        prevAbsenceRequestsIdsRef.current = currentDataKey
      }
    } else {
      setAllItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const newItems = lateArrivalRequests.filter((item) => !existingIds.has(item.id))
        if (newItems.length === 0) return prev
        const updated = [...prev, ...newItems]
        prevAbsenceRequestsIdsRef.current = updated
          .map((item) => `${item.id}:${item.status}`)
          .sort()
          .join(',')
        return updated
      })
    }

    if (lateArrivalRequests.length === 0 && offset === 0) {
      if (prevAbsenceRequestsIdsRef.current !== '') {
        setAllItems([])
        prevAbsenceRequestsIdsRef.current = ''
      }
    }
  }, [lateArrivalRequests, offset])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      const newLimit = page * pageSize
      setLimit(newLimit)
    },
    [pageSize]
  )

  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPage(1)
    setPageSize(size)
    setLimit(size)
  }, [])

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
    setLateArrivalDialogOpen(true)
  }

  const handleCreateClick = () => {
    setEditMode('create')
    setEditLeaveId(undefined)
    setEditInitialValues(null)
    setLateArrivalDialogOpen(true)
  }

  const handleSheetClose = (open: boolean) => {
    setLateArrivalDialogOpen(open)
    if (!open) {
      setEditMode('create')
      setEditLeaveId(undefined)
      setEditInitialValues(null)
    }
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

  const filterOptions = [
    {
      label: 'Tất cả',
      value: [StatusLeaves.APPROVED, StatusLeaves.PENDING, StatusLeaves.REJECTED] as LeavesStatus[],
      total: statusCounts?.total,
    },
    {
      label: 'Chờ duyệt',
      value: [StatusLeaves.PENDING] as LeavesStatus[],
      total: statusCounts?.pending,
    },
    {
      label: 'Đã duyệt',
      value: [StatusLeaves.APPROVED] as LeavesStatus[],
      total: statusCounts?.approved,
    },
    {
      label: 'Từ chối',
      value: [StatusLeaves.REJECTED] as LeavesStatus[],
      total: statusCounts?.rejected,
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen">
      <PageBreadcrumb />

      {/* Header - simple, similar to leave management */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="size-7" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý đi muộn</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi và quản lý các đơn đi muộn một cách hiệu quả
            </p>
          </div>
        </div>
        <Button onClick={handleCreateClick} className="gap-2 h-10 px-4">
          <Plus className="size-4" />
          Nộp đơn xin đi muộn
        </Button>
      </div>

      {/* Animated Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedFilterPills
          options={filterOptions}
          value={filterStatus}
          onChange={(value) => setFilterStatus(value as LeavesStatus[])}
        />
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StatisticsCards requests={statusCounts as any} />
      </motion.div>

      {/* Bảng danh sách đơn đi muộn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1"
      >
        <LateArrivalTable
          data={allItems}
          canApprove={canApprove as boolean}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          total={statusCounts?.total as any}
          hasMore={lateArrivalRequests && lateArrivalRequests.length >= limit}
          loading={isFetching}
          onActionClick={(id, action) => {
            const request = allItems.find((r) => r.id.toString() === id.toString())
            if (request) {
              handleActionClick(Number(id), action, request)
            }
          }}
          onViewDetails={(request) => {
            setSelectedRequest(request)
            setDetailRequestId(request.id)
            setViewDialogOpen(true)
          }}
          onEdit={handleEditLeave}
          onDelete={handleDeleteLeave}
          canEditOrDelete={canEditOrDelete}
        />
      </motion.div>

      {/* Late Arrival Detail Dialog */}
      <LateArrivalDetailDialog
        open={viewDialogOpen}
        onOpenChange={handleViewDialogChange}
        selectedRequest={selectedRequest || absenceRequestFromUrl}
        isLoading={isFetchingDetail || isFetchingDetailFromUrl}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        canEditOrDelete={canEditOrDelete}
        canApprove={canApprove as boolean}
        onActionClick={handleActionClick}
      />

      {/* Confirmation Dialog */}
      {actionType && (
        <ConfirmationDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          actionType={actionType}
          onConfirm={confirmAction}
          isLoading={isUpdatingStatus}
        />
      )}

      {/* Create Late Arrival Dialog */}
      <CreateLateArrivalDialog
        open={lateArrivalDialogOpen}
        onOpenChange={handleSheetClose}
        mode={editMode}
        leaveId={editLeaveId}
        initialValues={editInitialValues}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteLeaveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteLeave}
        isLoading={isRemovingLeave}
      />
    </div>
  )
}
