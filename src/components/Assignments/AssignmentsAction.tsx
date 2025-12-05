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
  const MAX_VISIBLE_MEMBERS = 5
  const members = projectAssignmentDetail?.members || []
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS)
  const remainingCount = members.length - MAX_VISIBLE_MEMBERS
  return (
    <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-start">
      {/* Project Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <h2 className="m-0 text-xl sm:text-2xl break-words">{project.name}</h2>
        <div className="flex items-start sm:items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Thành viên:</span>
          <div className="flex gap-1.5 flex-wrap items-center min-w-0">
            {projectAssignmentDetail?.memberIds && members.length > 0 ? (
              <>
                {visibleMembers.map((m: any) => (
                  <span
                    key={m.id}
                    className="text-xs px-2 py-0.5 border border-gray-200 rounded-full bg-gray-50 truncate max-w-[120px]"
                    title={m.name}
                  >
                    {m.name}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="text-xs px-2 py-0.5 border border-gray-300 rounded-full bg-slate-100 font-medium">
                    +{remainingCount}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">Chưa có thành viên</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

      {/* <CustomDialog open={showListMember} onOpenChange={setShowListMember} title="Thành viên" description="">
        <div>hi</div>
      </CustomDialog> */}
    </div>
  )
}
