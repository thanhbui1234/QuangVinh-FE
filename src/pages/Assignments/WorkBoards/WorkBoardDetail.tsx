import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGetWorkBoardDetail } from '@/hooks/workBoards/useGetWorkBoardDetail'
import { useAddColumn } from '@/hooks/workBoards/useAddColumn'
import { useUpdateColumn } from '@/hooks/workBoards/useUpdateColumn'
import { useRemoveColumn } from '@/hooks/workBoards/useRemoveColumn'
import { useCreateSheetRow } from '@/hooks/workBoards/useCreateSheetRow'
import { useUpdateSheetRowCell } from '@/hooks/workBoards/useUpdateSheetRowCell'
import { useRemoveSheetRow } from '@/hooks/workBoards/useRemoveSheetRow'
// TODO: Add pagination support later
// import { useGetSheetRowList } from '@/hooks/workBoards/useGetSheetRowList'
import { EditableTable } from '@/components/WorkBoards/EditableTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { IWorkBoardCell, IWorkBoardColumn } from '@/types/WorkBoard'
import { useIsMobile } from '@/hooks/use-mobile'
import { queryClient } from '@/lib/queryClient'
import { workBoardsKey } from '@/constants/assignments/assignment'

export const WorkBoardDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const sheetId = id ? Number(id) : undefined
  const { workBoard, isFetching, isLoading, error, refetchAndClearCache } =
    useGetWorkBoardDetail(sheetId)
  const { addColumnMutation } = useAddColumn({ suppressInvalidation: true })
  const { updateColumnMutation } = useUpdateColumn({ suppressInvalidation: true })
  const { removeColumnMutation } = useRemoveColumn({ suppressInvalidation: true })
  const { createSheetRowMutation } = useCreateSheetRow()
  const { updateSheetRowCellMutation } = useUpdateSheetRowCell()
  const { removeSheetRowMutation } = useRemoveSheetRow()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxWidth, setMaxWidth] = useState<string>('100%')
  // Track pending row creations to prevent duplicates
  const pendingRowCreations = useRef<Set<number>>(new Set())
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

  const [isManualRefetching, setIsManualRefetching] = useState(false)

  const handleSave = async (data: {
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

    try {
      // 1. Process Column Changes if any
      if (data.columnChanges) {
        const { columnChanges } = data
        const promises: Promise<any>[] = []

        // Add new columns
        for (const newColumn of columnChanges.added) {
          const columnIndex = data.columnHeaders.findIndex((col) => col.id === newColumn.id)
          promises.push(
            addColumnMutation.mutateAsync({
              sheetId,
              name: newColumn.name || newColumn.label,
              type: newColumn.type || 'text',
              index: newColumn.index ?? columnIndex,
              color: newColumn.color || '#FFFFFF',
              required: newColumn.required || false,
              options: newColumn.options || [],
            })
          )
        }

        // Update modified columns
        for (const { original, updated } of columnChanges.modified) {
          const originalName = original.name || original.label
          const updatedName = updated.name || updated.label

          const updatePayload: any = {
            sheetId,
            columnName: originalName,
          }

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

          if (Object.keys(updatePayload).length > 2) {
            promises.push(updateColumnMutation.mutateAsync(updatePayload))
          }
        }

        // Remove deleted columns
        for (const deletedColumn of columnChanges.deleted) {
          promises.push(
            removeColumnMutation.mutateAsync({
              sheetId,
              columnName: deletedColumn.name || deletedColumn.label,
            })
          )
        }

        // Wait for all column operations to complete
        if (promises.length > 0) {
          await Promise.all(promises)
          // Invalidate queries once after all column changes
          queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(sheetId)] })
          queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
        }
      }

      // 2. Process Cell Changes
      const originalCellsMap = new Map<string, string>()
      if (workBoard?.cells) {
        workBoard.cells.forEach((cell) => {
          const key = `${cell.rowIndex}-${cell.columnIndex}`
          originalCellsMap.set(key, cell.value)
        })
      }

      const changedCells = data.cells.filter((cell) => {
        const key = `${cell.rowIndex}-${cell.columnIndex}`
        const originalValue = originalCellsMap.get(key) || ''
        return cell.value !== originalValue
      })

      if (changedCells.length > 0) {
        // Group cells by rowIndex
        const cellsByRow = new Map<number, IWorkBoardCell[]>()
        changedCells.forEach((cell) => {
          if (!cellsByRow.has(cell.rowIndex)) {
            cellsByRow.set(cell.rowIndex, [])
          }
          cellsByRow.get(cell.rowIndex)!.push(cell)
        })

        // Process each row
        // Note: We use data.columnHeaders as the effective headers
        const effectiveColumnHeaders = data.columnHeaders

        for (const [rowIndex, cells] of cellsByRow.entries()) {
          const rowId = workBoard?.rowIdMap?.[rowIndex]

          // If row doesn't exist in backend, create it first
          if (!rowId) {
            // Check if we are already creating this row
            if (pendingRowCreations.current.has(rowIndex)) {
              continue
            }

            const rowData: Record<string, any> = {}
            cells.forEach((cell) => {
              const columnName =
                effectiveColumnHeaders[cell.columnIndex]?.name ||
                effectiveColumnHeaders[cell.columnIndex]?.label
              if (columnName) {
                rowData[columnName] = cell.value
              }
            })

            try {
              pendingRowCreations.current.add(rowIndex)
              await createSheetRowMutation.mutateAsync({
                sheetId,
                rowData,
                color: '#FFFFFF',
              })
            } catch (error) {
              console.error('Error creating row:', error)
            } finally {
              pendingRowCreations.current.delete(rowIndex)
            }
            continue
          }

          // Row exists, update each cell
          for (const cell of cells) {
            const columnName =
              effectiveColumnHeaders[cell.columnIndex]?.name ||
              effectiveColumnHeaders[cell.columnIndex]?.label

            if (!columnName) {
              console.warn(`No column name for columnIndex ${cell.columnIndex}, skipping`)
              continue
            }

            try {
              await updateSheetRowCellMutation.mutateAsync({
                rowId,
                columnName,
                value: cell.value,
              })
            } catch (error) {
              console.error(`Error updating cell:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error saving changes:', error)
    }
  }

  if (!sheetId || isNaN(sheetId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-4">ID bảng công việc không hợp lệ</p>
          <Button onClick={() => navigate('/work-boards')} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  const handleRefreshSheet = async () => {
    setIsManualRefetching(true)
    await refetchAndClearCache()
    setIsManualRefetching(false)
  }
  const handleDeleteRow = async (rowIndex: number) => {
    if (!sheetId || !workBoard) return
    const rowId = workBoard.rowIdMap?.[rowIndex]
    if (rowId) {
      try {
        await removeSheetRowMutation.mutateAsync({ rowId })
        // Invalidate queries to refresh the board
        queryClient.invalidateQueries({ queryKey: workBoardsKey.detail(sheetId) })
      } catch (error) {
        console.error('Error deleting row:', error)
      }
    }
  }

  // Only show loader if we don't have the workBoard data yet
  if (!workBoard && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Đang tải bảng công việc...</p>
        </div>
      </div>
    )
  }

  if (!workBoard && !isFetching && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-2">Không tìm thấy bảng công việc</p>
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
          {workBoard.description && (
            <p className="text-muted-foreground mt-1">{workBoard.description}</p>
          )}
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto" style={{ maxWidth }}>
        <div className="min-w-full">
          <EditableTable
            workBoard={workBoard}
            sheetId={sheetId}
            onSave={handleSave}
            isFetching={isLoading || isManualRefetching} // Only show loader on initial load OR manual refresh
            isSaving={
              createSheetRowMutation.isPending ||
              updateSheetRowCellMutation.isPending ||
              removeSheetRowMutation.isPending ||
              (isFetching && !isLoading && !isManualRefetching) // Show "Saving..." during background refetch if not initial/manual
            }
            onRefresh={handleRefreshSheet}
            // Passing undefined for onUnsavedChangesChange as we auto-save
            onUnsavedChangesChange={undefined}
            onDeleteRow={handleDeleteRow}
          />
        </div>
      </div>
    </div>
  )
}
