import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { IMemberTask } from '@/hooks/assignments/useGetMemberTask'
import { MessageCircle, Send, X, Pencil, Trash2, ImagePlus, Loader2 } from 'lucide-react'
import { MentionsInput, Mention } from 'react-mentions'
import type { SuggestionDataItem } from 'react-mentions'
import { useForm } from 'react-hook-form'
import { useCreateComment } from '@/hooks/assignments/comments/useCreateComment'
import SonnerToaster from '@/components/ui/toaster'
import { useNavigate } from 'react-router'
import { parseMentionsToHTML } from '@/utils/mentions'
import { useGetListComments } from '@/hooks/assignments/comments/useGetListComments'
import { useUploadFile } from '@/hooks/useUploadFile'
import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores'
import { useRemoveComment } from '@/hooks/assignments/comments/useRemoveComment'
import { DeleteCommentDialog } from '../ui/alertComponent'

const mentionsInputStyle = {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  '&multiLine': {
    control: {
      minHeight: 44,
    },
    highlighter: {
      padding: 9,
      paddingRight: 50,
      border: '1px solid transparent',
    },
    input: {
      padding: 9,
      paddingRight: 50,
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      outline: 'none',
      fontSize: 14,
      lineHeight: 1.5,
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      fontSize: 14,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      maxHeight: 200,
      overflow: 'auto',
    },
    item: {
      padding: '8px 12px',
      borderBottom: '1px solid #f3f4f6',
      '&focused': {
        backgroundColor: '#f9fafb',
      },
    },
  },
}

type CommentFormData = {
  message: string
}

export const CommentTask = ({ member, taskId }: { member: IMemberTask[]; taskId: number }) => {
  const { user } = useAuthStore()

  // Check if comment belongs to current user
  const isOwnComment = (commentCreatorId: number) => {
    return user?.id ? Number(user.id) === commentCreatorId : false
  }

  const { comments, isFetching } = useGetListComments(taskId)
  const createCommentMutation = useCreateComment()
  const uploadFileMutation = useUploadFile()
  const navigate = useNavigate()
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const removeCommentMutation = useRemoveComment({ taskId })
  const [open, setOpen] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)

  const { handleSubmit, watch, setValue, reset } = useForm<CommentFormData>({
    defaultValues: {
      message: '',
    },
  })

  const commentInput = watch('message')

  const handleUserClick = (userId: number) => {
    // Navigate to user profile page
    navigate(`/profile/${userId}`)
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      SonnerToaster({
        type: 'error',
        message: 'Chỉ chấp nhận file ảnh',
      })
      return
    }

    // Validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      SonnerToaster({
        type: 'error',
        message: 'Dung lượng file phải nhỏ hơn 2MB',
      })
      return
    }

    // Upload file
    uploadFileMutation.mutate(file, {
      onSuccess: (response) => {
        setUploadedImageUrls((prev) => [...prev, response.viewUrl])
        SonnerToaster({
          type: 'success',
          message: 'Upload ảnh thành công',
        })
      },
      onError: (error) => {
        SonnerToaster({
          type: 'error',
          message: 'Upload ảnh thất bại',
          description: error.message,
        })
      },
    })

    // Reset input
    e.target.value = ''
  }

  // Extract mention IDs from @[Name](ID) format
  const extractMentionIds = (message: string): number[] => {
    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g
    const mentionIds: number[] = []
    let match

    while ((match = mentionRegex.exec(message)) !== null) {
      const userId = parseInt(match[2], 10)
      if (!mentionIds.includes(userId)) {
        mentionIds.push(userId)
      }
    }

    return mentionIds
  }

  // Determine comment type based on content
  const getCommentType = (_: string, hasImages: boolean, hasMentions: boolean): number => {
    if (hasImages) return 4 // ATTACHMENT
    if (hasMentions) return 3 // MENTION
    return 1 // NORMAL
  }

  const onSubmit = async (data: CommentFormData) => {
    // Must have either message or images
    if (!data.message.trim() && uploadedImageUrls.length === 0) {
      SonnerToaster({
        type: 'error',
        message: 'Vui lòng nhập bình luận hoặc upload ảnh',
      })
      return
    }

    // Convert @[Name](ID) format to plain @Name for backend
    const plainMessage = data.message.replace(/@\[([^\]]+)\]\((\d+)\)/g, '@$1')
    const mentionIds = extractMentionIds(data.message)
    const hasMentions = mentionIds.length > 0
    const hasImages = uploadedImageUrls.length > 0

    try {
      await createCommentMutation.mutateAsync({
        taskId: taskId,
        message: plainMessage.trim() || undefined,
        imageUrls: hasImages ? uploadedImageUrls : undefined,
        commentType: getCommentType(plainMessage, hasImages, hasMentions),
        mentionIds: hasMentions ? mentionIds : undefined,
      })

      // Reset form and images
      reset()
      setUploadedImageUrls([])

      SonnerToaster({
        type: 'success',
        message: 'Đã thêm bình luận thành công',
      })
    } catch (error) {
      console.error(error)
      SonnerToaster({
        type: 'error',
        message: 'Có lỗi khi thêm bình luận',
      })
    }
  }

  // Transform data for mentions with search/filter support
  const usersData: SuggestionDataItem[] =
    member?.map((user) => ({
      id: String(user.id),
      display: user.name || user.email || 'Unknown',
    })) || []

  // Filter users based on search term for better >20 users support
  const filterUsers = (search: string, callback: (data: SuggestionDataItem[]) => void) => {
    const searchLower = search.toLowerCase()
    const filtered = usersData.filter((user) =>
      (user.display ?? '').toLowerCase().includes(searchLower)
    )
    callback(filtered)
  }

  const handleRemoveComment = (commentId: number) => {
    setSelectedCommentId(commentId)
    setOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedCommentId) return
    removeCommentMutation.mutate(selectedCommentId as number, {
      onSuccess: () => {
        SonnerToaster({
          type: 'success',
          message: 'Xóa bình luận thành công',
        })
        setOpen(false)
      },
    })
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Bình luận ({comments.length})</h3>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-100">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src="/photo_2025-09-26_12-28-52 (2).jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <MentionsInput
                      value={commentInput}
                      onChange={(e) => {
                        setValue('message', e.target.value)
                      }}
                      onKeyDown={(e) => {
                        // Submit on Enter (without Shift)
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(onSubmit)()
                        }
                        // Allow Shift+Enter for new line (default behavior)
                      }}
                      placeholder="Viết bình luận... (gõ @ để mention người)"
                      style={mentionsInputStyle}
                      className="mentions-input"
                    >
                      <Mention
                        trigger="@"
                        data={filterUsers}
                        displayTransform={(_id, display) => `@${display}`}
                        markup="@[__display__](__id__)"
                        style={{
                          backgroundColor: '#dbeafe',
                          borderRadius: '3px',
                          padding: '1px 3px',
                        }}
                      />
                    </MentionsInput>

                    <button
                      type="submit"
                      disabled={
                        (!commentInput?.trim() && uploadedImageUrls.length === 0) ||
                        createCommentMutation.isPending
                      }
                      className={`absolute right-3 bottom-3 shrink-0 transition-colors ${
                        (!commentInput?.trim() && uploadedImageUrls.length === 0) ||
                        createCommentMutation.isPending
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-900 hover:text-blue-600 cursor-pointer'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Upload Icon Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={uploadFileMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 text-gray-500 hover:text-gray-700"
                  >
                    {uploadFileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Image Preview */}
                {uploadedImageUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {uploadedImageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImageUrls((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
            {isFetching && comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.commentId} className="flex gap-3 group">
                  <Avatar
                    onClick={() => handleUserClick(c.creator.id)}
                    className="w-9 h-9 shrink-0 cursor-pointer"
                  >
                    <AvatarImage src={c.creator?.avatar} alt={c.creator?.name} />
                    <AvatarFallback>{c.creator?.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 relative">
                    {/* Edit/Delete buttons - Only show on hover for own comments */}
                    {isOwnComment(c.creator.id) && (
                      <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-blue-600"
                          onClick={() => {
                            console.log('Edit comment:', c.commentId)
                            // TODO: Implement edit logic
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-red-600"
                          onClick={() => {
                            handleRemoveComment(c.commentId)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        onClick={() => handleUserClick(c.creator.id)}
                        className="font-medium text-sm text-gray-900 cursor-pointer hover:text-blue-600"
                      >
                        {c.creator?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdTime).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {parseMentionsToHTML(c.message, c.mentionUsers, handleUserClick)}
                    </p>
                    {c.imageUrls && c.imageUrls.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {c.imageUrls.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Comment attachment ${idx + 1}`}
                            className="w-50 rounded border border-gray-200 cursor-pointer hover:opacity-90"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <DeleteCommentDialog open={open} onOpenChange={setOpen} onConfirm={handleConfirmDelete} />
    </>
  )
}
