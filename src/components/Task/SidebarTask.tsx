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
import { Input } from '../ui/input'
export const SidebarTask = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  const path = window.location.href
  return (
    <div className="relative lg:col-span-1">
      <Card className="border-0 shadow-sm sticky top-6 hidden lg:block">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Thông tin công việc</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
                <MdOutlineContentCopy className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={4} alignOffset={4}>
                <DropdownMenuLabel>Sao chép liên đường dẫn</DropdownMenuLabel>
                <Input
                  value={path}
                  readOnly
                  className="fit-content"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Người được giao
              </label>
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white font-semibold">
                  {projectAssignmentDetail?.assignee.name}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {projectAssignmentDetail?.assignee.name}
                  </div>
                  <div className="text-xs text-gray-500">Assignee</div>
                </div>
              </div>
            </div>

            {/* Assigner */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Người giao việc
              </label>
              <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shrink-0 text-white font-semibold"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {projectAssignmentDetail?.creator.name}
                  </div>
                  <div className="text-xs text-gray-500">Reporter</div>
                </div>
              </div>
            </div>

            {/* Estimate */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Thời gian ước lượng
              </label>
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                  <Clock4 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {getFormattedEstimate(
                    projectAssignmentDetail?.startTime,
                    projectAssignmentDetail?.estimateTime
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Dates */}
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
