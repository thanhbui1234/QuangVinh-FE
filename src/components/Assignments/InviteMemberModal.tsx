import React, { useEffect, useState } from 'react'
import { useGetAllUser, type IUser } from '@/hooks/assignments/useGetAllUser'
import { useInviteUser } from '@/hooks/assignments/useInviteUser'

export type InviteMemberModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskGroupId: number
  // Danh sách email của các thành viên đã được mời / đã là member
  existingMemberEmails: string[]
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open,
  onOpenChange,
  taskGroupId,
  existingMemberEmails,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { allUser, isLoading } = useGetAllUser()
  const { createProjectMutation } = useInviteUser()

  useEffect(() => {
    if (!open) setSelectedIds([])
  }, [open])

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleSend() {
    if (selectedIds.length === 0) {
      onOpenChange(false)
      return
    }

    createProjectMutation.mutate(
      {
        memberIds: selectedIds.map((id) => Number(id)),
        taskGroupId,
      },
      {
        onSuccess: () => {
          setSelectedIds([])
          onOpenChange(false)
        },
      }
    )
  }

  if (!open) return null

  const users = allUser || []
  // Lọc theo email: chỉ hiển thị những user chưa được mời (email chưa có trong existingMemberEmails)
  const candidates = users.filter((u: IUser) => {
    const email = u.email || ''
    if (!email) return false
    return !existingMemberEmails.includes(email)
  })

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={() => onOpenChange(false)} className="absolute inset-0 bg-black/35" />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(560px,92vw)] bg-white rounded-xl border border-gray-200 shadow-xl p-4"
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <strong className="text-lg">Mời thành viên vào dự án</strong>
            <span className="text-gray-500">
              Chọn user để mời. Những người đã là thành viên sẽ bị ẩn.
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="bg-transparent border-none text-lg leading-none cursor-pointer hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <div className="max-h-[300px] overflow-auto border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="p-3 text-gray-500">Đang tải danh sách user...</div>
            ) : candidates.length > 0 ? (
              candidates.map((u: IUser) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 py-2.5 px-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(u.id))}
                    onChange={() => toggle(String(u.id))}
                    className="cursor-pointer"
                  />
                  <span>{u.name || u.email}</span>
                </label>
              ))
            ) : (
              <div className="p-3 text-gray-500">Tất cả user đã là thành viên.</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSend}
              disabled={selectedIds.length === 0 || createProjectMutation.isPending}
              className="px-3 py-2 rounded-md border border-gray-900 bg-gray-900 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-800"
            >
              {createProjectMutation.isPending ? 'Đang gửi...' : 'Gửi lời mời'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteMemberModal
