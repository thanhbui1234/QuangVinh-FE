import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router'
import { useGetWorkBoardDetail } from '@/hooks/workBoards/useGetWorkBoardDetail'
import { useUpdateWorkBoard } from '@/hooks/workBoards/useUpdateWorkBoard'
import { useAddColumn } from '@/hooks/workBoards/useAddColumn'
import { useUpdateColumn } from '@/hooks/workBoards/useUpdateColumn'
import { useRemoveColumn } from '@/hooks/workBoards/useRemoveColumn'
import { EditableTable } from '@/components/WorkBoards/EditableTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { IWorkBoardCell, IWorkBoardColumn } from '@/types/WorkBoard'
import { useIsMobile } from '@/hooks/use-mobile'

export const WorkBoardDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const sheetId = id ? Number(id) : undefined
  const { workBoard, isFetching, error } = useGetWorkBoardDetail(sheetId)
  const { updateWorkBoardMutation } = useUpdateWorkBoard()
  const { addColumnMutation } = useAddColumn()
  const { updateColumnMutation } = useUpdateColumn()
  const { removeColumnMutation } = useRemoveColumn()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxWidth, setMaxWidth] = useState<string>('100%')

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingSaveData, setPendingSaveData] = useState<{
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
    columnChanges?: {
      added: IWorkBoardColumn[]
      modified: Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>
      deleted: IWorkBoardColumn[]
    }
  } | null>(null)

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  )

  // Handle beforeunload for closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Handle navigation blocker
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setPendingNavigation(() => () => {
        blocker.proceed()
      })
      setShowUnsavedChangesDialog(true)
    }
  }, [blocker])

  // Calculate max width based on sidebar/tabbar
  useEffect(() => {
    const calculateMaxWidth = () => {
      if (isMobile) {
        // On mobile, tabbar is at bottom, so full width minus padding
        setMaxWidth('calc(100vw - 2rem)') // 2rem for padding (p-4 = 1rem each side)
      } else {
        // On web, find sidebar width by looking for the sidebar element
        // The sidebar has classes like "w-18" (72px) or "w-80" (320px)
        const sidebar = document.querySelector(
          'div[class*="w-18"], div[class*="w-80"]'
        ) as HTMLElement
        if (sidebar) {
          const sidebarWidth = sidebar.offsetWidth || sidebar.getBoundingClientRect().width
          // Account for padding (p-4 = 1rem = 16px each side = 32px total)
          const padding = 32
          setMaxWidth(`calc(100vw - ${sidebarWidth}px - ${padding}px)`)
        } else {
          // Fallback: try to find by looking for flex container with sidebar
          // Or use a reasonable default
          setTimeout(() => {
            const sidebar = document.querySelector(
              'div[class*="w-18"], div[class*="w-80"]'
            ) as HTMLElement
            if (sidebar) {
              const sidebarWidth = sidebar.offsetWidth || sidebar.getBoundingClientRect().width
              const padding = 32
              setMaxWidth(`calc(100vw - ${sidebarWidth}px - ${padding}px)`)
            } else {
              // Default to expanded sidebar width (320px)
              setMaxWidth('calc(100vw - 320px - 32px)')
            }
          }, 100)
        }
      }
    }

    // Initial calculation
    calculateMaxWidth()

    // Recalculate on resize
    window.addEventListener('resize', calculateMaxWidth)

    // Recalculate when sidebar class changes (collapse/expand)
    const observer = new MutationObserver(() => {
      setTimeout(calculateMaxWidth, 50) // Small delay to ensure DOM is updated
    })

    // Observe the document body for class changes on sidebar
    const sidebar = document.querySelector('div[class*="w-18"], div[class*="w-80"]')
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class'],
        childList: false,
        subtree: false,
      })
    }

    // Also observe the parent container in case sidebar is added dynamically
    const mainContainer = document.querySelector('div.flex.h-screen')
    if (mainContainer) {
      observer.observe(mainContainer, {
        attributes: false,
        childList: true,
        subtree: true,
      })
    }

    return () => {
      window.removeEventListener('resize', calculateMaxWidth)
      observer.disconnect()
    }
  }, [isMobile])

  const handleSave = (data: {
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
    columnChanges?: {
      added: IWorkBoardColumn[]
      modified: Array<{ original: IWorkBoardColumn; updated: IWorkBoardColumn }>
      deleted: IWorkBoardColumn[]
    }
  }) => {
    if (!sheetId) return

    // Check if there are column changes
    if (data.columnChanges) {
      // Show confirmation dialog
      setPendingSaveData(data)
      setShowConfirmDialog(true)
    } else {
      // No column changes, just save normally
      updateWorkBoardMutation.mutate(
        {
          id: sheetId,
          rows: data.rows,
          columns: data.columns,
          columnHeaders: data.columnHeaders,
          cells: data.cells,
        },
        {
          onSuccess: () => {
            // Data saved successfully
            setHasUnsavedChanges(false)
          },
        }
      )
    }
  }

  const handleConfirmSave = async () => {
    if (!sheetId || !pendingSaveData) return

    setShowConfirmDialog(false)

    try {
      // Process column changes
      const { columnChanges } = pendingSaveData

      if (columnChanges) {
        // Add new columns
        for (const newColumn of columnChanges.added) {
          // Find the index in the current columnHeaders array
          const columnIndex = pendingSaveData.columnHeaders.findIndex(
            (col) => col.id === newColumn.id
          )
          await addColumnMutation.mutateAsync({
            sheetId,
            name: newColumn.name || newColumn.label,
            type: newColumn.type || 'text',
            index: newColumn.index ?? columnIndex,
            color: newColumn.color || '#FFFFFF',
            required: newColumn.required || false,
            options: newColumn.options || [],
          })
        }

        // Update modified columns
        for (const { original, updated } of columnChanges.modified) {
          const originalName = original.name || original.label
          const updatedName = updated.name || updated.label

          const updatePayload: any = {
            sheetId,
            columnName: originalName,
          }

          // Only include fields that actually changed
          if (updatedName && updatedName !== originalName) {
            updatePayload.newColumnName = updatedName
          }
          if (updated.index !== undefined && updated.index !== original.index) {
            updatePayload.newIndex = updated.index
          }
          if (updated.color && updated.color !== original.color) {
            updatePayload.newColor = updated.color
          }
          if (updated.required !== undefined && updated.required !== original.required) {
            updatePayload.newRequired = updated.required
          }
          const originalOptionsStr = JSON.stringify(original.options || [])
          const updatedOptionsStr = JSON.stringify(updated.options || [])
          if (updatedOptionsStr !== originalOptionsStr) {
            updatePayload.newOptions = updated.options || []
          }

          // Only call API if there are actual changes (beyond just the columnName field)
          if (Object.keys(updatePayload).length > 2) {
            await updateColumnMutation.mutateAsync(updatePayload)
          }
        }

        // Remove deleted columns
        for (const deletedColumn of columnChanges.deleted) {
          await removeColumnMutation.mutateAsync({
            sheetId,
            columnName: deletedColumn.name || deletedColumn.label,
          })
        }
      }

      // After all column operations, save the rest of the data
      updateWorkBoardMutation.mutate(
        {
          id: sheetId,
          rows: pendingSaveData.rows,
          columns: pendingSaveData.columns,
          columnHeaders: pendingSaveData.columnHeaders,
          cells: pendingSaveData.cells,
        },
        {
          onSuccess: () => {
            // Data saved successfully
            setPendingSaveData(null)
            setHasUnsavedChanges(false)
          },
        }
      )
    } catch (error) {
      console.error('Error saving column changes:', error)
      setPendingSaveData(null)
    }
  }

  const handleConfirmLeave = () => {
    setHasUnsavedChanges(false)
    setShowUnsavedChangesDialog(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }

  const handleCancelLeave = () => {
    setShowUnsavedChangesDialog(false)
    setPendingNavigation(null)
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }

  if (!sheetId || isNaN(sheetId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">ID bảng công việc không hợp lệ</p>
          <Button onClick={() => navigate('/work-boards')} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải bảng công việc...</p>
        </div>
      </div>
    )
  }

  if (!workBoard && !isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">Không tìm thấy bảng công việc</p>
          {error && (
            <p className="text-sm text-red-500 mb-4">
              {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu'}
            </p>
          )}
          <Button onClick={() => navigate('/work-boards')} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  if (!workBoard) {
    return null
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/work-boards')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{workBoard.name}</h1>
          {workBoard.description && <p className="text-gray-600 mt-1">{workBoard.description}</p>}
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto" style={{ maxWidth }}>
        <div className="min-w-full">
          <EditableTable
            workBoard={workBoard}
            onSave={handleSave}
            isSaving={
              updateWorkBoardMutation.isPending ||
              addColumnMutation.isPending ||
              updateColumnMutation.isPending ||
              removeColumnMutation.isPending
            }
            onUnsavedChangesChange={setHasUnsavedChanges}
          />
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận lưu thay đổi</AlertDialogTitle>
            <AlertDialogDescription>
              Những thay đổi của bạn về cột không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSaveData(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Đồng ý</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cảnh báo thay đổi chưa lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Những thay đổi của bạn chưa được lưu. Bạn vẫn muốn rời đi chứ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLeave}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
