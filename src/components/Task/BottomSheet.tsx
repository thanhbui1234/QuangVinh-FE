import { Calendar, Clock4, UserPlus2 } from 'lucide-react'
import BottomSheet from '../ui/bottom-sheet'
import { STATUS_LABEL, type TaskRow } from '../Assignments/ProjectDetailTable/columns'
import { Separator } from '@radix-ui/react-dropdown-menu'
import MiniAvatar from '../ui/MiniAvatar'

export const BottomSheetTask = ({
  infoOpen,
  setInfoOpen,
  task,
}: {
  infoOpen: boolean
  setInfoOpen: (open: boolean) => void
  task: any
}) => {
  const assignees = task?.assignees || []
  const supervisor = task?.supervisor
  const creator = task?.creator

  return (
    <BottomSheet
      open={infoOpen}
      onOpenChange={setInfoOpen}
      title="Thông tin công việc"
      padded={false}
      contentClassName="rounded-t-2xl p-0"
    >
      <div className="p-6 space-y-4">
        {/* ASSIGNEES */}
        <div className="flex items-start gap-3">
          <UserPlus2 className="w-4 h-4 text-blue-600 mt-1" />
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Người được giao</div>

            {assignees.length > 0 ? (
              <div className="space-y-2">
                {assignees.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <MiniAvatar name={u.name} avatar={u.avatar} />
                    <span className="text-sm font-medium text-gray-900 truncate">{u.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Chưa gán</div>
            )}
          </div>
        </div>

        {/* CREATOR */}
        <div className="flex items-center gap-3">
          <MiniAvatar name={creator?.name} avatar={creator?.avatar} />
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">Người giao</div>
            <div className="font-medium text-sm text-gray-900">{creator?.name || '--'}</div>
          </div>
        </div>

        {/* SUPERVISOR */}
        <div className="flex items-center gap-3">
          <MiniAvatar name={supervisor?.name} avatar={supervisor?.avatar} />
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">Người chịu trách nhiệm</div>
            <div className="font-medium text-sm text-gray-900">{supervisor?.name || '--'}</div>
          </div>
        </div>

        {/* ESTIMATE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
            <Clock4 className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">Ước lượng</div>
            <div className="font-medium text-sm text-gray-900">
              {task?.estimateTime ? new Date(task.estimateTime).toLocaleDateString('vi-VN') : '-'}
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                task.status === 4
                  ? 'bg-green-500'
                  : task.status === 3
                    ? 'bg-blue-500'
                    : task.status === 5
                      ? 'bg-red-500'
                      : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">Trạng thái</div>
            <div className="font-medium text-sm text-gray-900">
              {STATUS_LABEL[task.status as TaskRow['status']]}
            </div>
          </div>
        </div>

        <Separator />

        {/* CREATED */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500">Ngày tạo</div>
            <div className="text-sm font-medium">
              {task?.createdTime ? new Date(task.createdTime).toLocaleDateString('vi-VN') : '--'}
            </div>
          </div>
        </div>

        {/* UPDATED */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500">Cập nhật</div>
            <div className="text-sm font-medium">
              {task?.updatedTime ? new Date(task.updatedTime).toLocaleDateString('vi-VN') : '--'}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
