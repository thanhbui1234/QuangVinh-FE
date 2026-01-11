import { useState } from 'react'
import { Search, Plus, Loader2, FileSpreadsheet, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useGetSheetList } from '@/hooks/workBoards/useGetSheetList'
import { useAddSheetCollection } from '@/hooks/colection/addSheetCollection'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AddSheetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: number
}

export const AddSheetModal = ({ open, onOpenChange, collectionId }: AddSheetModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 400)

  // Use the infinite scroll enabled hook
  const { sheets, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetSheetList({
    textSearch: debouncedSearch,
    size: 20,
  })

  const { addSheetCollectionMutation } = useAddSheetCollection(collectionId)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
    // Trigger update when near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleAdd = (sheetId: number) => {
    addSheetCollectionMutation.mutate(
      { sheetId, collectionId },
      {
        onSuccess: () => {
          // Success feedback handled by mutation hook (usually toast)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-none z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            Thêm bảng vào bộ sưu tập
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5 font-normal">
            Tìm kiếm và chọn các bảng công việc để thêm vào bộ sưu tập này.
          </p>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
            <Input
              placeholder="Tìm kiếm theo tên bảng..."
              className="pl-9 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 transition-all h-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div
          className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="p-4">
            {isLoading && sheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
              </div>
            ) : sheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mt-1">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sheets.map((sheet: any) => (
                  <div
                    key={sheet.id}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => handleAdd(sheet.id)}
                  >
                    <div className="flex-none w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2 group-hover:text-primary transition-colors">
                            {sheet.sheetName}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <Badge
                              variant="secondary"
                              className="font-normal h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                            >
                              ID: {sheet.id}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Badge
                                variant={sheet.sheetType === 1 ? 'default' : 'secondary'}
                                className={cn(
                                  'h-5 font-normal',
                                  sheet.sheetType === 1 && 'bg-green-500 hover:bg-green-600'
                                )}
                              >
                                {sheet.sheetType === 1 ? 'Công khai' : 'Riêng tư'}
                              </Badge>
                            </span>
                          </div>
                        </div>

                        <div className="flex-none">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-9 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-colors shadow-sm font-medium"
                            disabled={addSheetCollectionMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdd(sheet.id)
                            }}
                          >
                            {addSheetCollectionMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1.5" />
                                Thêm
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{sheet.viewableUserIds?.length || 0} thành viên</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
