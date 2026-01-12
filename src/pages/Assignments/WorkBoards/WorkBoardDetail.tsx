import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGetWorkBoardDetail } from '@/hooks/workBoards/useGetWorkBoardDetail'
import { useUpdateColumns } from '@/hooks/workBoards/useUpdateColumns'
import { useCreateSheetRow } from '@/hooks/workBoards/useCreateSheetRow'
import { useUpdateSheetRowCell } from '@/hooks/workBoards/useUpdateSheetRowCell'
import { useRemoveSheetRow } from '@/hooks/workBoards/useRemoveSheetRow'
// TODO: Add pagination support later
// import { useGetSheetRowList } from '@/hooks/workBoards/useGetSheetRowList'
import { EditableTable } from '@/components/WorkBoards/EditableTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import type { IWorkBoardCell, IWorkBoardColumn } from '@/types/WorkBoard'
import { useIsMobile } from '@/hooks/use-mobile'
import { queryClient } from '@/lib/queryClient'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { SettingWorkBoards } from '@/components/WorkBoards/SettingWorkBoards'
import useCheckRole from '@/hooks/useCheckRole'
export const WorkBoardDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const sheetId = id ? Number(id) : undefined
  const { workBoard, isFetching, isLoading, error, refetchAndClearCache } =
    useGetWorkBoardDetail(sheetId)
  const hasPermission = useCheckRole()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { updateColumnsMutation } = useUpdateColumns({ suppressInvalidation: true })
  const { createSheetRowMutation } = useCreateSheetRow()
  const { updateSheetRowCellMutation } = useUpdateSheetRowCell()
  const { removeSheetRowMutation } = useRemoveSheetRow()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxWidth, setMaxWidth] = useState<string>('100%')
  // Track pending row creations to prevent duplicates
  const pendingRowCreations = useRef<Set<number>>(new Set())
  // Track in-flight cell updates to prevent redundant calls
  const pendingUpdates = useRef<Set<string>>(new Set())
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
    cellChanges?: IWorkBoardCell[]
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
        // Send the full list of columns to sync the state
        const columnsPayload = data.columnHeaders.map((col, idx) => {
          const mod = data.columnChanges?.modified.find((m) => m.updated.id === col.id)
          const currentName = col.name || col.label
          const originalName = mod ? mod.original.name || mod.original.label : undefined

          return {
            name: currentName,
            index: col.index ?? idx,
            color: col.color || '#FFFFFF',
            required: col.required || false,
            options: col.options || [],
            type: col.type || 'text',
            ...(mod && originalName && originalName !== currentName
              ? { oldName: originalName }
              : {}),
          }
        })

        if (columnsPayload.length > 0) {
          try {
            await updateColumnsMutation.mutateAsync({
              sheetId,
              version: 1,
              columns: columnsPayload,
            })

            // Invalidate queries once after column changes
            queryClient.invalidateQueries({ queryKey: [workBoardsKey.detail(sheetId)] })
            queryClient.invalidateQueries({ queryKey: [workBoardsKey.getAll] })
          } catch (error) {
            console.error('❌ Error updating columns:', error)
            // Revert changes by refetching
            await refetchAndClearCache()
            // Stop further processing as column state is invalid
            return
          }
        }
      }

      // 2. Process Cell Changes
      let changedCells: IWorkBoardCell[] = []

      if (data.cellChanges && data.cellChanges.length > 0) {
        // Use the explicit delta provided by the table
        // Filter out changes that are already in-flight
        changedCells = data.cellChanges.filter((cell) => {
          const updateKey = `cell-${cell.rowIndex}-${cell.columnIndex}-${cell.value}`
          return !pendingUpdates.current.has(updateKey)
        })
      } else if (!data.cellChanges) {
        // Only fall back to manual diffing if cellChanges is explicitly undefined (not just empty)
        // This is a safety measure for unexpected states
        const originalCellsMap = new Map<string, string>()
        if (workBoard?.cells) {
          workBoard.cells.forEach((cell) => {
            const key = `${cell.rowIndex}-${cell.columnIndex}`
            originalCellsMap.set(key, cell.value)
          })
        }

        changedCells = data.cells.filter((cell) => {
          const key = `${cell.rowIndex}-${cell.columnIndex}`
          const originalValue = originalCellsMap.get(key) || ''
          const updateKey = `cell-${cell.rowIndex}-${cell.columnIndex}-${cell.value}`
          return cell.value !== originalValue && !pendingUpdates.current.has(updateKey)
        })
      }

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

          // Row exists, update cells concurrently
          const updatePromises = cells.map(async (cell) => {
            const columnName =
              effectiveColumnHeaders[cell.columnIndex]?.name ||
              effectiveColumnHeaders[cell.columnIndex]?.label

            if (!columnName) return

            const updateKey = `cell-${cell.rowIndex}-${cell.columnIndex}-${cell.value}`

            try {
              pendingUpdates.current.add(updateKey)
              await updateSheetRowCellMutation.mutateAsync({
                rowId,
                columnName,
                value: cell.value,
              })

              // Optimistically update cache to satisfy future diffs
              queryClient.setQueryData([workBoardsKey.detail(sheetId)], (oldData: any) => {
                if (!oldData || !oldData.workBoard) return oldData
                const newWorkBoard = { ...oldData.workBoard }
                const newCells = [...(newWorkBoard.cells || [])]
                const idx = newCells.findIndex(
                  (c) => c.rowIndex === cell.rowIndex && c.columnIndex === cell.columnIndex
                )

                if (idx !== -1) {
                  newCells[idx] = { ...newCells[idx], value: cell.value }
                } else {
                  newCells.push({
                    rowIndex: cell.rowIndex,
                    columnIndex: cell.columnIndex,
                    value: cell.value,
                  })
                }

                newWorkBoard.cells = newCells
                return { ...oldData, workBoard: newWorkBoard }
              })
            } catch (error) {
              console.error(`Error updating cell:`, error)
            } finally {
              // Note: We might want to keep it in pending for a short while to avoid race conditions
              // with the inevitable refetch, but clearing it here is standard.
              setTimeout(() => pendingUpdates.current.delete(updateKey), 2000)
            }
          })

          await Promise.all(updatePromises)
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

  const handleCreateRow = async () => {
    if (!sheetId) return
    try {
      await createSheetRowMutation.mutateAsync({
        sheetId,
        rowData: {},
        color: '#FFFFFF',
      })
    } catch (error) {
      console.error('Error creating row:', error)
    }
  }

  // Only show loader if we don't have the workBoard data yet
  if (!workBoard && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-8 p-12 bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Vui lòng đợi</h3>
            <p className="text-slate-400 font-medium text-sm px-4">
              Đang chuẩn bị không gian làm việc của bạn...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!workBoard && !isFetching && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="text-center p-12 bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white max-w-md mx-4">
          <div className="bg-slate-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-slate-200">
            <ArrowLeft className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
            Không tìm thấy dữ liệu
          </h3>
          <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">
            {error instanceof Error
              ? error.message
              : 'Dữ liệu không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <Button
            onClick={() => navigate('/work-boards')}
            className="rounded-2xl h-14 px-8 w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold tracking-tight"
          >
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/20">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/work-boards')}
            className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-primary/5 hover:text-primary transition-all group shrink-0"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-800">
                {workBoard.name}
              </h1>
              {hasPermission && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
            {workBoard.description && (
              <p className="text-sm font-medium text-slate-400 max-w-2xl leading-relaxed">
                {workBoard.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Action buttons could go here */}
        </div>
      </div>

      <SettingWorkBoards
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        sheetId={sheetId}
        currentName={workBoard.name}
      />

      <div ref={containerRef} className="w-full relative" style={{ maxWidth }}>
        <div className="rounded-3xl overflow-hidden ring-1 ring-slate-200/50">
          <EditableTable
            workBoard={workBoard}
            sheetId={sheetId}
            onSave={handleSave}
            isFetching={isLoading || isManualRefetching}
            isSaving={
              createSheetRowMutation.isPending ||
              updateSheetRowCellMutation.isPending ||
              removeSheetRowMutation.isPending ||
              (isFetching && !isLoading && !isManualRefetching)
            }
            onRefresh={handleRefreshSheet}
            onUnsavedChangesChange={undefined}
            onDeleteRow={handleDeleteRow}
            onCreateRow={handleCreateRow}
          />
        </div>
      </div>
    </div>
  )
}
