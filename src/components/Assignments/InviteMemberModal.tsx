import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [searchQuery, setSearchQuery] = useState('')
  const { allUser, isLoading } = useGetAllUser()
  const { createProjectMutation } = useInviteUser()

  useEffect(() => {
    if (!open) {
      setSelectedIds([])
      setSearchQuery('')
    }
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
          setSearchQuery('')
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

  // Lọc theo search query
  const filteredCandidates = candidates.filter((u: IUser) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const name = (u.name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
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
          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* User List */}
          {/* User List */}
          <div className="h-[300px] overflow-auto border border-gray-200 rounded-lg relative bg-gray-50/50">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3" />
                <span className="text-sm font-medium">Đang tải danh sách...</span>
              </div>
            ) : filteredCandidates.length > 0 ? (
              <div className="absolute inset-0">
                {filteredCandidates.map((u: IUser) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-b-0 cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(String(u.id))}
                      onChange={() => toggle(String(u.id))}
                      className="cursor-pointer w-4 h-4 accent-gray-900 rounded border-gray-300"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">{u.name || u.email}</span>
                      {u.name && u.email && (
                        <span className="text-xs text-gray-500">{u.email}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
                {searchQuery ? (
                  <>
                    <svg
                      className="w-12 h-12 mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-7-3a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm">Không tìm thấy user phù hợp</p>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-12 h-12 mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-sm">Tất cả user đã là thành viên</p>
                  </>
                )}
              </div>
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
