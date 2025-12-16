import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock4 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatTimestamp, getFormattedEstimate } from '@/utils/CommonUtils'
import { MdOutlineContentCopy } from 'react-icons/md'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import UserAvatar from '../ui/avatarUser'

export const SidebarTask = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const path = window.location.href

  const assignees = projectAssignmentDetail?.assignees || []
  const supervisor = projectAssignmentDetail?.supervisor

  return (
    <div className="relative lg:col-span-1">
      <Card className="border-0 shadow-sm sticky top-6 hidden lg:block">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Thông tin công việc</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">
                <MdOutlineContentCopy className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuLabel>Sao chép liên kết</DropdownMenuLabel>
                <Input value={path} readOnly autoFocus onFocus={(e) => e.target.select()} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-5">
            {/* ASSIGNEES */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Người được giao
              </label>

              <div className="space-y-2">
                {assignees.length > 0 ? (
                  assignees.map((user: any) => (
                    <div key={user.id} className="p-3 bg-blue-50/50 rounded-lg">
                      <UserAvatar id={user.id} name={user.name} avatar={user.avatar} />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">Chưa có người được giao</div>
                )}
              </div>
            </div>

            {/* REPORTER */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Người giao việc
              </label>
              <div className="p-3 bg-purple-50/50 rounded-lg">
                <UserAvatar
                  id={projectAssignmentDetail?.creator?.id}
                  name={projectAssignmentDetail?.creator?.name}
                  avatar={projectAssignmentDetail?.creator?.avatar}
                />
              </div>
            </div>

            {/* SUPERVISOR */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Người chịu trách nhiệm
              </label>
              <div className="p-3 bg-green-50/50 rounded-lg">
                <UserAvatar
                  id={supervisor?.id}
                  name={supervisor?.name}
                  avatar={supervisor?.avatar}
                />
              </div>
            </div>

            {/* ESTIMATE */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Thời gian ước lượng
              </label>
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Clock4 className="w-5 h-5 text-white" />
                </div>
                {getFormattedEstimate(
                  projectAssignmentDetail?.startTime,
                  projectAssignmentDetail?.estimateTime
                )}
              </div>
            </div>

            <Separator />

            {/* DATES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Ngày bắt đầu công việc</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatTimestamp(projectAssignmentDetail?.startTime)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Ngày tạo</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatTimestamp(projectAssignmentDetail?.createdTime)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Cập nhật</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatTimestamp(projectAssignmentDetail?.updatedTime)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
