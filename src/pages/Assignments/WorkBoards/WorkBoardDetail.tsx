import React from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGetWorkBoardDetail } from '@/hooks/workBoards/useGetWorkBoardDetail'
import { useUpdateWorkBoard } from '@/hooks/workBoards/useUpdateWorkBoard'
import { EditableTable } from '@/components/WorkBoards/EditableTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { IWorkBoardCell, IWorkBoardColumn } from '@/types/WorkBoard'

export const WorkBoardDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { workBoard, isFetching } = useGetWorkBoardDetail(Number(id))
  const { updateWorkBoardMutation } = useUpdateWorkBoard()

  const handleSave = (data: {
    rows: number
    columns: number
    columnHeaders: IWorkBoardColumn[]
    cells: IWorkBoardCell[]
  }) => {
    if (!id) return

    updateWorkBoardMutation.mutate(
      {
        id: Number(id),
        ...data,
      },
      {
        onSuccess: () => {
          // Data saved successfully
        },
      }
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

  if (!workBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">Không tìm thấy bảng công việc</p>
          <Button onClick={() => navigate('/work-boards')} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
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

      <EditableTable
        workBoard={workBoard}
        onSave={handleSave}
        isSaving={updateWorkBoardMutation.isPending}
      />
    </div>
  )
}
