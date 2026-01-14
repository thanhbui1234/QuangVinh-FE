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

            // 2. Create 1 default row
            const rowData: Record<string, any> = {}
            if (columnsToUse.length > 0) {
              rowData[columnsToUse[0]] = `Dòng 1`
            }

            await createSheetRowMutation.mutateAsync({
              sheetId: validSheetId,
              rowData,
              color: '#FFFFFF',
            })
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
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="flex flex-col items-center gap-6 p-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-xl font-bold tracking-tight text-foreground">Vui lòng đợi</h3>
            <p className="text-muted-foreground text-sm font-medium">
              Đang tải danh sách bảng công việc...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0c0c0e] text-foreground/90 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <PageBreadcrumb />

      {/* Modern & Soft Header */}
      <div className="bg-card/40 p-6 md:p-8 rounded-3xl border border-border/20 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Bảng công việc</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Quản lý và tổ chức các bảng dữ liệu của bạn chuyên nghiệp hơn
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-80 group">
              <Input
                placeholder="Tìm kiếm bảng..."
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="h-11 pl-11 pr-4 rounded-xl border-border/20 bg-muted/20 focus:bg-background focus:ring-1 focus:ring-primary/10 transition-all font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary/60 transition-colors">
                <Plus className="h-4 w-4 rotate-45" />
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-2xl shadow-2xl z-50 max-h-[400px] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {createSearchMutation.isPending ? (
                    <div className="p-6 text-center flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Đang tìm kiếm...
                      </p>
                    </div>
                  ) : (
                    <ul className="p-1">
                      {searchResults.map((board) => (
                        <li key={board.id}>
                          <Link
                            to={`/work-boards/${board.id}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors group/item"
                          >
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                              <Plus className="h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{board.sheetName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">
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
                className="h-11 px-6 rounded-xl font-bold shadow-sm transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thành bảng mới
              </Button>
            )}
          </div>
        </div>
      </div>

      {workBoards.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md w-full p-12 text-center bg-card rounded-3xl border border-border shadow-md">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Plus className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-bold mb-2 tracking-tight">Chưa có bảng nào</h3>
            <p className="text-muted-foreground text-sm mb-10 leading-relaxed px-4">
              Hãy tạo một không gian làm việc mới để bắt đầu quản lý dữ liệu.
            </p>
            {isManagerPermission && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-dashed border-border font-bold hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Khởi tạo bảng đầu tiên
              </Button>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workBoards.map((board) => (
            <Card
              key={board.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/20 bg-card/40 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 cursor-pointer relative backdrop-blur-sm"
              onClick={() => navigate(`/work-boards/${board.id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Work Board
                  </p>
                  <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                    {board.sheetName}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Plus className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-auto space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/4 rounded-full group-hover:w-full group-hover:bg-primary transition-all duration-700" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">#{board.id}</span>
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                    <span>Cập nhật</span>
                    <span className="text-foreground font-semibold">
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
            className="h-12 px-10 rounded-xl border-border bg-card font-bold text-muted-foreground hover:text-primary transition-all shadow-sm"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
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
