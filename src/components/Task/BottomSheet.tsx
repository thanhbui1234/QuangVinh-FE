import { Calendar, Clock4, UserPlus2 } from 'lucide-react'
import BottomSheet from '../ui/bottom-sheet'
import { STATUS_LABEL, type TaskRow } from '../Assignments/ProjectDetailTable/columns'
import { Separator } from '@radix-ui/react-dropdown-menu'

export const BottomSheetTask = ({
  infoOpen,
  setInfoOpen,
  task,
}: {
  infoOpen: boolean
  setInfoOpen: (open: boolean) => void
  task: any
}) => {
  return (
    <BottomSheet
      open={infoOpen}
      onOpenChange={setInfoOpen}
      title="Thông tin công việc"
      padded={false}
      contentClassName="rounded-t-2xl p-0"
    >
      <div className="p-6 space-y-4">
        {/* Assignee */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <UserPlus2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Người được giao</div>
            <div className="font-medium text-sm text-gray-900 truncate">
              {task?.assignee?.name || <span className="text-gray-400">Chưa gán</span>}
            </div>
          </div>
        </div>

        {/* Assigner */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            {/* <UserCircle2 className="w-4 h-4 text-purple-600" /> */}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Người giao</div>
            <div className="font-medium text-sm text-gray-900">{task?.assigner?.name}</div>
          </div>
        </div>

        {/* Estimate */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <Clock4 className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Ước lượng</div>
            <div className="font-medium text-sm text-gray-900">
              {task.estimateHours ? `${task.estimateHours} giờ` : '-'}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                task.status === 'done'
                  ? 'bg-green-500'
                  : task.status === 'cancel'
                    ? 'bg-red-500'
                    : task.status === 'in_progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Trạng thái</div>
            <div className="font-medium text-sm text-gray-900">
              {STATUS_LABEL[task.status as TaskRow['status']]}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Created Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Ngày tạo</div>
            <div className="font-medium text-sm text-gray-900">
              {new Date('2025-10-29T09:30:00Z').toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Updated Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Cập nhật</div>
            <div className="font-medium text-sm text-gray-900">
              {new Date('2025-10-29T13:15:00Z').toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
