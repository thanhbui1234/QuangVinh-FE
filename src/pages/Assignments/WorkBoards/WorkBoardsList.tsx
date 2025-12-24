import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useGetWorkBoards } from '@/hooks/workBoards/useGetWorkBoards'
import { CreateWorkBoardModal } from '@/components/WorkBoards/CreateWorkBoardModal'
import { useCreateWorkBoard } from '@/hooks/workBoards/useCreateWorkBoard'
import type { CreateSheetPayload } from '@/types/Sheet'
import { Card } from '@/components/ui/card'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import useCheckRole from '@/hooks/useCheckRole'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router'

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
      textSearch: searchText,
      size: 10,
    })
  const { createWorkBoardMutation } = useCreateWorkBoard()
  const { isManagerPermission } = useCheckRole()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()

  const isInitialLoading = isFetching && workBoards.length === 0

  const handleCreate = (data: CreateSheetPayload) => {
    createWorkBoardMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false)
      },
    })
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải danh sách bảng công việc...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <h1 className="text-2xl font-semibold">Bảng công việc</h1>
          <div className="w-full sm:w-80">
            <Input
              placeholder="Tìm kiếm theo tên bảng..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        {isManagerPermission && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bảng mới
          </Button>
        )}
      </div>

      {workBoards.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Chưa có bảng công việc nào</p>
          {isManagerPermission && (
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tạo bảng đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workBoards.map((board) => (
            <Card
              key={board.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer"
              onClick={() => navigate(`/work-boards/${board.id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    Bảng dữ liệu
                  </p>
                  <h3 className="font-semibold text-base text-slate-900 line-clamp-1">
                    {board.sheetName}
                  </h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  ID #{board.id}
                </span>
              </div>

              <div className=" flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {board.columns?.length || 0} cột
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                    {board.viewableUserIds?.length || 0} người xem
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                    {board.editableUserIds?.length || 0} người sửa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cập nhật: {formatDate(board.updatedTime || board.createdTime)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateWorkBoardModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createWorkBoardMutation.isPending}
      />

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Đang tải thêm...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}
