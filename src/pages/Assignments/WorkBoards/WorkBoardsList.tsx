import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useGetWorkBoards } from '@/hooks/workBoards/useGetWorkBoards'
import { CreateWorkBoardModal } from '@/components/WorkBoards/CreateWorkBoardModal'
import { useCreateWorkBoard } from '@/hooks/workBoards/useCreateWorkBoard'
import { useUpdateColumns } from '@/hooks/workBoards/useUpdateColumns'
import { useCreateSheetRow } from '@/hooks/workBoards/useCreateSheetRow'
import type { CreateSheetPayload } from '@/types/Sheet'
import { Card } from '@/components/ui/card'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import useCheckRole from '@/hooks/useCheckRole'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router'
import { LoadingOverlay } from '@/components/common/LoadingOverlay'
import SonnerToaster from '@/components/ui/toaster'
import { useSearchWorkBoard } from '@/hooks/workBoards/useSearchWorkBoard'
import { useDebouncedCallback } from 'use-debounce'
import { Link } from 'react-router'
import type { ISheetInfo } from '@/types/WorkBoard'

const formatDate = (value?: number) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('vi-VN')
}

export const WorkBoardsList: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const { workBoards, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useGetWorkBoards({
      size: 10,
    })
  const { createSearchMutation } = useSearchWorkBoard()
  const { createWorkBoardMutation } = useCreateWorkBoard()
  const { isManagerPermission } = useCheckRole()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()

  const [searchResults, setSearchResults] = useState<ISheetInfo[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    if (searchValue.trim()) {
      createSearchMutation.mutate(searchValue, {
        onSuccess: (data: any) => {
          // Assuming response structure, adjust based on actual API return
          setSearchResults(data?.sheetInfos || data || [])
          setShowSearchDropdown(true)
        },
      })
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, 500)

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    debouncedSearch(value)
  }

  const isInitialLoading = isFetching && workBoards.length === 0

  /* Hooks for seeding data */
  const { updateColumnsMutation } = useUpdateColumns()

  const { createSheetRowMutation } = useCreateSheetRow()

  const [isSeeding, setIsSeeding] = useState(false)

  const handleCreate = (data: CreateSheetPayload) => {
    setIsCreateOpen(false)
    createWorkBoardMutation.mutate(data, {
      onSuccess: async (res) => {
        // But usually res is the response body. Let's check api wrapper.
        // Assuming res contains the id or we need to find it?
        // Actually, createWorkBoard uses ICreateSheetRowResponse? No, it's custom.
        // Let's look at useCreateWorkBoard.
        // Re-checking useCreateWorkBoard... it returns ICreateWorkBoardResponse?
        // Wait, standard mutation onSuccess receives the Data.

        setIsSeeding(true)
        let newSheetId: number | undefined
        try {
          // We need the ID. The response should have it.
          // If 'res' has 'id' or 'sheetId'.
          // Let's check types later if needed, but for now assuming `res.id` or `res`.
          newSheetId = (res as any)?.id || (res as any)?.sheetId

          if (newSheetId) {
            const validSheetId = newSheetId
            let columnsToUse: string[] = []

            // 1. Create Default Columns if none provided
            if (!data.columns || data.columns.length === 0) {
              const defaultCols = Array.from({ length: 6 }, (_, i) => `Cột ${i + 1}`)
              columnsToUse = defaultCols

              await updateColumnsMutation.mutateAsync({
                sheetId: validSheetId,
                version: 1,
                columns: defaultCols.map((name, i) => ({
                  name,
                  type: 'text',
                  index: i,
                  color: '#FFFFFF',
                  required: false,
                  options: [],
                })),
              })
            } else {
              columnsToUse = data.columns.map((c) => c.name)
              // Also sync if custom columns provided?
              // For simplicity, if columns are provided in 'data', they might already be handled by the BE on creation.
              // But if they are not, we should sync them too.
              // Looking at handleCreate, it seems 'data' is passed to createWorkBoardMutation.
              // If createWorkBoardMutation already handles columns, then we don't need this step.
              // However, the original code had this logic to add columns if they were NOT in data.
            }

            // 2. Create Default Rows (16 rows)
            // We can do this in parallel chunks effectively
            const rowPromises = Array.from({ length: 16 }, (_, i) => {
              const rowData: Record<string, any> = {}
              // Fill first column with example data?
              if (columnsToUse.length > 0) {
                rowData[columnsToUse[0]] = `Dòng ${i + 1}`
              }

              return createSheetRowMutation.mutateAsync({
                sheetId: validSheetId,
                rowData,
                color: '#FFFFFF',
              })
            })
            await Promise.all(rowPromises)
          }
        } catch (error) {
          console.error('Error seeding default data:', error)
        } finally {
          setIsSeeding(false)
          setIsCreateOpen(false)
          SonnerToaster({
            type: 'success',
            message: 'Tạo bảng công việc thành công',
          })
        }
      },
    })
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-8 p-12 bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                <Plus className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Vui lòng đợi</h3>
            <p className="text-slate-400 font-medium text-sm px-4">
              Đang chuẩn bị danh sách bảng công việc của bạn...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <PageBreadcrumb />

      {/* Premium Header */}
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bảng công việc</h1>
            </div>
            <p className="text-slate-400 font-medium text-sm ml-13">
              Quản lý và theo dõi tiến độ công việc của bạn một cách hiệu quả
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-96 group">
              <Input
                placeholder="Tìm kiếm bảng công việc..."
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="h-14 pl-12 pr-4 rounded-2xl border-transparent bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-bold text-slate-700 shadow-inner"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Plus className="h-5 w-5 rotate-45" />
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl z-50 max-h-[400px] overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  {createSearchMutation.isPending ? (
                    <div className="p-8 text-center flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Đang tìm kiếm...
                      </p>
                    </div>
                  ) : (
                    <ul className="p-2">
                      {searchResults.map((board) => (
                        <li key={board.id} className="mb-1 last:mb-0">
                          <Link
                            to={`/work-boards/${board.id}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group/item"
                          >
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                              <Plus className="h-4 w-4 text-slate-400 group-hover/item:text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 tracking-tight">
                                {board.sheetName}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                ID #{board.id}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Overlay to close dropdown */}
              {showSearchDropdown && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowSearchDropdown(false)}
                />
              )}
            </div>

            {isManagerPermission && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-14 px-8 rounded-2xl font-black tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo bảng mới
              </Button>
            )}
          </div>
        </div>
      </div>

      {workBoards.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md w-full p-12 text-center bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-slate-200">
              <Plus className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
              Chưa có bảng nào
            </h3>
            <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed px-4">
              Bạn chưa có bảng công việc nào. Hãy tạo một không gian làm việc mới để bắt đầu.
            </p>
            {isManagerPermission && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
                className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 font-black text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo bảng đầu tiên
              </Button>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workBoards.map((board) => (
            <Card
              key={board.id}
              className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer relative"
              onClick={() => navigate(`/work-boards/${board.id}`)}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                  <Plus className="h-5 w-5 rotate-45" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Work Board
                  </p>
                  <h3 className="font-black text-xl text-slate-800 line-clamp-1 tracking-tight group-hover:text-primary transition-colors">
                    {board.sheetName}
                  </h3>
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 rounded-full group-hover:w-1/2 transition-all duration-1000" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    ID #{board.id}
                  </span>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Cập nhật</span>
                    <span className="text-slate-500">
                      {formatDate(board.updatedTime || board.createdTime)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-8 pb-12">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="h-14 px-12 rounded-2xl border-2 font-black text-slate-500 hover:bg-white hover:border-primary hover:text-primary transition-all shadow-xl shadow-slate-200/50"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Đang tải...
              </div>
            ) : (
              'Xem thêm kết quả'
            )}
          </Button>
        </div>
      )}

      <CreateWorkBoardModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createWorkBoardMutation.isPending || isSeeding}
      />

      <LoadingOverlay isOpen={isSeeding} message="Đang khởi tạo bảng dữ liệu..." />
    </div>
  )
}
