import { Button } from '@/components/ui/button.tsx'
import { Calendar, Plus } from 'lucide-react'
import { useLeaves } from '@/hooks/leaves/useLeaves.ts'
import LeavesTable from '@/components/Leaves/LeavesTable.tsx'
import StatisticsCards from '@/components/Leaves/StatisticsCards.tsx'
import ViewDetailsDialog from '@/components/Leaves/ViewDetailsDialog.tsx'
import ConfirmationDialog from '@/components/Leaves/ConfirmationDialog.tsx'
import CreateLeaveDialog from '@/components/Leaves/CreateLeaveDialog.tsx'
import DeleteLeaveDialog from '@/components/Leaves/DeleteLeaveDialog.tsx'
import useGetLeavesList from '@/hooks/leaves/useGetLeavesList.ts'
import {
  type LeavesStatus,
  StatusLeaves,
  type LeavesListDataResponse,
  type LeaveFormValues,
} from '@/types/Leave.ts'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { convertToDateInput } from '@/utils/CommonUtils.ts'
import { useRemoveLeaves } from '@/hooks/leaves/useRemoveLeaves'
import { useAuthStore } from '@/stores/authStore'

export default function LeavesWeb() {
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
    viewDetails,
    isUpdatingStatus,
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

  const { removeLeavesMutate, isRemovingLeave } = useRemoveLeaves()
  const { user } = useAuthStore()

  const filterStatusKey = useMemo(() => JSON.stringify([...filterStatus].sort()), [filterStatus])

  // Check if current user is the creator of the leave request
  const canEditOrDelete = useCallback(
    (request: LeavesListDataResponse) => {
      return user?.email && request.creator?.email && user.email === request.creator.email
    },
    [user?.email]
  )

  const queryParams = useMemo(
    () => ({
      statuses: filterStatus,
      offset,
      limit,
    }),
    [filterStatusKey, offset, limit]
  )

  const { absenceRequests, isFetching, statusCounts } = useGetLeavesList(queryParams)

  const prevFilterStatusKeyRef = useRef<string>(filterStatusKey)
  const prevAbsenceRequestsIdsRef = useRef<string>('')

  useEffect(() => {
    if (prevFilterStatusKeyRef.current !== filterStatusKey) {
      setOffset(0)
      setAllItems([])
      setCurrentPage(1)
      setPageSize(10)
      setLimit(10)
      prevFilterStatusKeyRef.current = filterStatusKey
      prevAbsenceRequestsIdsRef.current = ''
    }
  }, [filterStatusKey])

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

  useEffect(() => {
    if (!absenceRequests) {
      if (offset === 0 && prevAbsenceRequestsIdsRef.current !== '') {
        setAllItems([])
        prevAbsenceRequestsIdsRef.current = ''
      }
      return
    }

    const currentDataKey = absenceRequests
      .map((item) => `${item.id}:${item.status}`)
      .sort()
      .join(',')

    if (offset === 0) {
      if (currentDataKey !== prevAbsenceRequestsIdsRef.current) {
        setAllItems(absenceRequests)
        prevAbsenceRequestsIdsRef.current = currentDataKey
      }
    } else {
      setAllItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const newItems = absenceRequests.filter((item) => !existingIds.has(item.id))
        if (newItems.length === 0) return prev
        const updated = [...prev, ...newItems]
        prevAbsenceRequestsIdsRef.current = updated
          .map((item) => `${item.id}:${item.status}`)
          .sort()
          .join(',')
        return updated
      })
    }

    if (absenceRequests.length === 0 && offset === 0) {
      if (prevAbsenceRequestsIdsRef.current !== '') {
        setAllItems([])
        prevAbsenceRequestsIdsRef.current = ''
      }
    }
  }, [absenceRequests, offset])

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

  const currentTotal = useMemo(() => {
    if (!statusCounts) return 0

    const key = filterStatusKey

    if (
      key ===
      JSON.stringify([StatusLeaves.APPROVED, StatusLeaves.PENDING, StatusLeaves.REJECTED].sort())
    ) {
      return statusCounts.total
    }
    if (key === JSON.stringify([StatusLeaves.PENDING].sort())) {
      return statusCounts.pending
    }
    if (key === JSON.stringify([StatusLeaves.APPROVED].sort())) {
      return statusCounts.approved
    }
    if (key === JSON.stringify([StatusLeaves.REJECTED].sort())) {
      return statusCounts.rejected
    }

    return 0
  }, [filterStatusKey, statusCounts])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
          <Calendar className="size-7" />
          Quản lý nghỉ phép
        </h1>
        <Button onClick={handleCreateClick} className="gap-2 h-10 px-4">
          <Plus className="size-4" />
          Tạo đơn xin nghỉ
        </Button>
      </div>

      {/* Filter Status */}
      <div className="flex gap-2">
        {filterOptions.map((option) => {
          const optionKey = JSON.stringify([...option.value].sort())
          const isActive = filterStatusKey === optionKey

          return (
            <Button
              key={option.label}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => {
                if (!isActive) {
                  setFilterStatus([...option.value])
                }
              }}
              className="h-9"
            >
              {option.label}
            </Button>
          )
        })}
      </div>

      <StatisticsCards requests={statusCounts} />
      <LeavesTable
        data={allItems}
        canApprove={canApprove}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        total={currentTotal || (0 as any)}
        hasMore={absenceRequests && absenceRequests.length >= limit}
        loading={isFetching}
        onActionClick={(id, action) => {
          const request = allItems.find((r) => r.id.toString() === id.toString())
          if (request) {
            handleActionClick(Number(id), action, request)
          }
        }}
        onViewDetails={viewDetails}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        canEditOrDelete={canEditOrDelete}
      />

      {/* View Details Dialog */}
      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        selectedRequest={selectedRequest}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
        canEditOrDelete={canEditOrDelete}
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

      {/* Create Leave Request Dialog */}
      <CreateLeaveDialog
        open={createDialogOpen}
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
