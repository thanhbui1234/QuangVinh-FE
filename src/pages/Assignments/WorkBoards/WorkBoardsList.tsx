import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useGetWorkBoards } from '@/hooks/workBoards/useGetWorkBoards'
import { useDeleteWorkBoard } from '@/hooks/workBoards/useDeleteWorkBoard'
import { CreateWorkBoardModal } from '@/components/WorkBoards/CreateWorkBoardModal'
import { DialogConfirm } from '@/components/ui/alertComponent'
import { useCreateWorkBoard } from '@/hooks/workBoards/useCreateWorkBoard'
import { Link } from 'react-router'
import type { IWorkBoard, ICreateWorkBoard } from '@/types/WorkBoard'
import { Card } from '@/components/ui/card'

export const WorkBoardsList: React.FC = () => {
  const { workBoards, isFetching } = useGetWorkBoards()
  const { createWorkBoardMutation } = useCreateWorkBoard()
  const { deleteWorkBoardMutation } = useDeleteWorkBoard()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState<IWorkBoard | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleCreate = (data: ICreateWorkBoard) => {
    createWorkBoardMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false)
      },
    })
  }

  const handleDelete = (board: IWorkBoard) => {
    setBoardToDelete(board)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (boardToDelete) {
      deleteWorkBoardMutation.mutate(boardToDelete.id)
      setBoardToDelete(null)
    }
    setIsDeleteOpen(false)
  }

  if (isFetching) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Bảng công việc</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo bảng mới
        </Button>
      </div>

      {workBoards.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Chưa có bảng công việc nào</p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Tạo bảng đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workBoards.map((board) => (
            <Card key={board.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{board.name}</h3>
                  {board.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{board.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <span>{board.rows} hàng</span>
                    <span>{board.columns} cột</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Link to={`/work-boards/${board.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(board)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      <DialogConfirm
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa bảng công việc này?"
        description="Hành động này không thể hoàn tác."
      />
    </div>
  )
}
