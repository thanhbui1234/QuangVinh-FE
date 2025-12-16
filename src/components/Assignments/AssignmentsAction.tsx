import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useNavigate } from 'react-router'
import useCheckRole from '@/hooks/useCheckRole'
export default function AssignmentsAction({
  project,
  projectAssignmentDetail,
  setIsInviteOpen,
  setIsCreateOpen,
}: {
  project: any
  projectAssignmentDetail: any
  setIsInviteOpen: (open: boolean) => void
  setIsCreateOpen: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { hasPermission } = useCheckRole()
  const members = projectAssignmentDetail?.members || []
  const displayMembers = members.slice(0, 10) // Max 10 items
  return (
    <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-start">
      {/* Project Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <h2 className="m-0 text-xl sm:text-2xl break-words">{project.name}</h2>
        <div className="flex items-start sm:items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Thành viên:</span>
          <div className="relative flex-1 min-w-0 max-w-[220px] sm:max-w-[500px]">
            <div className="no-scrollbar flex items-center min-w-0 overflow-x-auto flex-nowrap pr-6">
              {projectAssignmentDetail?.memberIds && members.length > 0 ? (
                <TooltipProvider delayDuration={200}>
                  <div className="flex -space-x-2">
                    {displayMembers.map((m: any, index: number) => (
                      <Tooltip key={m.id}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => navigate(`/profile/${m.id}`)}
                            className="relative cursor-pointer transition-transform hover:scale-110 hover:z-10"
                            style={{ zIndex: displayMembers.length - index }}
                          >
                            <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-gray-100 hover:ring-blue-400">
                              <AvatarImage src={m.avatar} alt={m.name || m.email} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                {m.name?.charAt(0)?.toUpperCase() ||
                                  m.email?.charAt(0)?.toUpperCase() ||
                                  '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm font-medium">{m.name || m.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {members.length > 10 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 ring-2 ring-gray-100 cursor-default"
                            style={{ zIndex: 0 }}
                          >
                            <span className="text-xs font-medium text-gray-600">
                              +{members.length - 10}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">Còn {members.length - 10} thành viên khác</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>
              ) : (
                <span className="text-xs text-gray-400">Chưa có thành viên</span>
              )}
            </div>
            {members.length > 0 && displayMembers.length > 5 && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-4 w-8">
                <svg
                  className="h-3 w-3 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasPermission && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto sm:shrink-0">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-slate-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Mời thành viên
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-2 rounded-md border border-gray-300 bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Tạo công việc mới
          </button>
        </div>
      )}

      {/* <CustomDialog open={showListMember} onOpenChange={setShowListMember} title="Thành viên" description="">
        <div>hi</div>
      </CustomDialog> */}
    </div>
  )
}
