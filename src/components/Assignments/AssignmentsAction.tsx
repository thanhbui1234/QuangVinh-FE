import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useNavigate } from 'react-router'
import { Settings, Plus, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { STATUS_PROJECT } from '@/constants/assignments/privacy'
import { cn } from '@/lib/utils'

export default function AssignmentsAction({
  project,
  projectAssignmentDetail,
  setIsInviteOpen,
  setIsCreateOpen,
  onEdit,
}: {
  project: any
  projectAssignmentDetail: any
  setIsInviteOpen: (open: boolean) => void
  setIsCreateOpen: (open: boolean) => void
  onEdit?: () => void
}) {
  const navigate = useNavigate()
  const members = projectAssignmentDetail?.members || []
  const displayMembers = members.slice(0, 10) // Max 10 items
  const status = projectAssignmentDetail?.status

  const getStatusConfig = (status: number) => {
    switch (status) {
      case STATUS_PROJECT.CREATED:
        return {
          label: 'Mới tạo',
          className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
        }

      case STATUS_PROJECT.IN_PROGRESS:
        return {
          label: 'Đang thực hiện',
          className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200',
        }
      case STATUS_PROJECT.COMPLETED:
        return {
          label: 'Đã hoàn thành',
          className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
        }
      default:
        return {
          label: 'Không xác định',
          className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
        }
    }
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      {/* Project Info */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="m-0 text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 break-words tracking-tight">
            {project.name}
          </h2>
          {status && (
            <Badge
              variant="outline"
              className={cn(
                'px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 cursor-default',
                statusConfig.className
              )}
            >
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full mr-1.5 opacity-60',
                  statusConfig.className.split(' ')[1]
                )}
                style={{ backgroundColor: 'currentColor' }}
              ></div>
              {statusConfig.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Team</span>
          <div className="h-4 w-[1px] bg-border mx-1"></div>
          <div className="flex items-center flex-1 min-w-0">
            {projectAssignmentDetail?.memberIds && members.length > 0 ? (
              <TooltipProvider delayDuration={200}>
                <div className="flex -space-x-2.5 hover:space-x-1 transition-all duration-300 px-2 overflow-visible py-1">
                  {displayMembers.map((m: any, index: number) => (
                    <Tooltip key={m.id}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => navigate(`/profile/${m.id}`)}
                          className="relative cursor-pointer transition-transform hover:scale-110 hover:z-20 hover:-translate-y-1"
                          style={{ zIndex: displayMembers.length - index }}
                        >
                          <Avatar className="h-8 w-8 border-2 border-card ring-1 ring-border shadow-sm">
                            <AvatarImage
                              src={m.avatar}
                              alt={m.name || m.email}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-bold">
                              {m.name?.charAt(0)?.toUpperCase() ||
                                m.email?.charAt(0)?.toUpperCase() ||
                                '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="text-xs font-medium px-2 py-1 bg-foreground text-background border-0 shadow-xl"
                      >
                        {m.name || m.email}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {members.length > 10 && (
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-muted-foreground font-semibold text-xs shadow-sm z-0 hover:bg-accent transition-colors">
                      +{members.length - 10}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            ) : (
              <span className="text-xs italic text-gray-400">Chưa có thành viên nào</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
        <button
          onClick={() => setIsInviteOpen(true)}
          className="group flex items-center justify-center h-9 px-3.5 gap-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground hover:border-border transition-all duration-200 shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-muted active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          <span className="whitespace-nowrap">Mời</span>
        </button>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="group flex-1 md:flex-none flex items-center justify-center h-9 px-4 gap-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-slate-900/20 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Tạo việc</span>
        </button>

        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-border transition-all duration-200 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-muted active:scale-95"
            title="Cài đặt dự án"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
