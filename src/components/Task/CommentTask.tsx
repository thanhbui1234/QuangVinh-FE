import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { IMemberTask } from '@/hooks/assignments/useGetMemberTask'
import { MessageCircle, Send, X, Pencil, Trash2, ImagePlus, Loader2, Smile } from 'lucide-react'
import { MentionsInput, Mention } from 'react-mentions'
import type { SuggestionDataItem } from 'react-mentions'
import { useForm } from 'react-hook-form'
import { useCreateComment } from '@/hooks/assignments/comments/useCreateComment'
import SonnerToaster from '@/components/ui/toaster'
import { useNavigate } from 'react-router'
import { parseMentionsToHTML } from '@/utils/mentions'
import { useGetListComments } from '@/hooks/assignments/comments/useGetListComments'
import { useUploadFile } from '@/hooks/useUploadFile'
import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useRemoveComment } from '@/hooks/assignments/comments/useRemoveComment'
import { useUpdateComment } from '@/hooks/assignments/comments/useUpdateComment'
import { DialogConfirm } from '../ui/alertComponent'
import { isMobile } from 'react-device-detect'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import dayjs from 'dayjs'
import EmojiPicker from 'emoji-picker-react'

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
      backgroundColor: 'transparent',
      color: 'inherit',
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
  const updateCommentMutation = useUpdateComment({ taskId })
  const uploadFileMutation = useUploadFile()
  const navigate = useNavigate()

  // Image upload state - track files with their upload status
  type ImageUpload = {
    file: File
    preview: string // ObjectURL for instant preview
    uploadedUrl: string | null // URL from API after upload
    isUploading: boolean
  }
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRef = useRef(false)

  const removeCommentMutation = useRemoveComment({ taskId })
  const [open, setOpen] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)

  // Edit state - track which comment is being edited
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      SonnerToaster({
        type: 'error',
        message: 'Dung lượng file phải nhỏ hơn 5MB',
      })
      return
    }

    // Create preview URL immediately for instant display
    const preview = URL.createObjectURL(file)

    // Add to state with preview (instant display)
    const newUpload: ImageUpload = {
      file,
      preview,
      uploadedUrl: null,
      isUploading: true,
    }

    setImageUploads((prev) => [...prev, newUpload])

    // Upload file in background
    uploadFileMutation.mutate(file, {
      onSuccess: (response) => {
        // Update upload status with URL
        setImageUploads((prev) =>
          prev.map((upload) =>
            upload.preview === preview
              ? { ...upload, uploadedUrl: response.viewUrl, isUploading: false }
              : upload
          )
        )
        SonnerToaster({
          type: 'success',
          message: 'Upload ảnh thành công',
        })
      },
      onError: (error) => {
        // Remove failed upload
        setImageUploads((prev) => prev.filter((upload) => upload.preview !== preview))
        URL.revokeObjectURL(preview)
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

  // Cancel editing - clear main input
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null)
    reset()
    // Clean up ObjectURLs
    imageUploads.forEach((upload) => {
      if (upload.preview.startsWith('blob:')) {
        URL.revokeObjectURL(upload.preview)
      }
    })
    setImageUploads([])
  }, [reset, imageUploads])

  const onSubmit = useCallback(
    async (data: CommentFormData) => {
      // Prevent double submit
      if (isSubmittingRef.current) {
        return
      }

      isSubmittingRef.current = true

      // Get uploaded URLs (only completed uploads)
      const uploadedUrls = imageUploads
        .filter((upload) => upload.uploadedUrl !== null)
        .map((upload) => upload.uploadedUrl as string)

      // Must have either message or images
      if (!data.message.trim() && uploadedUrls.length === 0) {
        SonnerToaster({
          type: 'error',
          message: 'Vui lòng nhập bình luận hoặc upload ảnh',
        })
        isSubmittingRef.current = false
        return
      }

      // Convert @[Name](ID) format to plain @Name for backend
      const plainMessage = data.message.replace(/@\[([^\]]+)\]\((\d+)\)/g, '@$1')
      const mentionIds = extractMentionIds(data.message)
      const hasMentions = mentionIds.length > 0
      const hasImages = uploadedUrls.length > 0

      try {
        if (editingCommentId) {
          // Update existing comment
          await updateCommentMutation.mutateAsync({
            commentId: editingCommentId,
            taskId: taskId,
            message: plainMessage.trim() || undefined,
            imageUrls: hasImages ? uploadedUrls : undefined,
            commentType: getCommentType(plainMessage, hasImages, hasMentions),
            mentionIds: hasMentions ? mentionIds : undefined,
          })

          SonnerToaster({
            type: 'success',
            message: 'Cập nhật bình luận thành công',
          })
          handleCancelEdit()
        } else {
          // Create new comment
          await createCommentMutation.mutateAsync({
            taskId: taskId,
            message: plainMessage.trim() || undefined,
            imageUrls: hasImages ? uploadedUrls : undefined,
            commentType: getCommentType(plainMessage, hasImages, hasMentions),
            mentionIds: hasMentions ? mentionIds : undefined,
          })
        }

        // Reset form and images
        reset()
        // Clean up ObjectURLs
        imageUploads.forEach((upload) => URL.revokeObjectURL(upload.preview))
        setImageUploads([])
      } catch (error) {
        console.error(error)
      } finally {
        // Reset flag after a short delay to prevent rapid re-submissions
        setTimeout(() => {
          isSubmittingRef.current = false
        }, 500)
      }
    },
    [
      imageUploads,
      editingCommentId,
      updateCommentMutation,
      createCommentMutation,
      taskId,
      reset,
      handleCancelEdit,
    ]
  )

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

  // Start editing a comment - populate main input
  const handleStartEdit = (commentId: number, currentMessage: string, currentImages?: string[]) => {
    setEditingCommentId(commentId)
    setValue('message', currentMessage)
    // Convert existing URLs to ImageUpload format (already uploaded)
    const existingUploads: ImageUpload[] = (currentImages || []).map((url) => ({
      file: new File([], ''), // Dummy file for existing images
      preview: url, // Use URL as preview
      uploadedUrl: url,
      isUploading: false,
    }))
    setImageUploads(existingUploads)
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Bình luận ({comments.length})</h3>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3 mb-6 pb-6 border-b border-border">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    {/* Emoji Picker - Show when button is clicked */}
                    {showEmojiPicker && !isMobile && (
                      <div className="absolute bottom-14 right-12 z-50">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setValue('message', commentInput + emojiData.emoji)
                          }}
                        />
                      </div>
                    )}

                    <MentionsInput
                      value={commentInput}
                      onChange={(e) => {
                        setValue('message', e.target.value)
                      }}
                      onKeyDown={(e) => {
                        // Handle Enter key submission
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault() // Prevent default newline
                          e.stopPropagation() // Prevent event bubbling

                          // Check if already submitting
                          if (isSubmittingRef.current) {
                            return
                          }

                          // Only submit if form is valid (has content or images)
                          const hasContent = commentInput?.trim() || imageUploads.length > 0
                          const isUploading =
                            createCommentMutation.isPending ||
                            updateCommentMutation.isPending ||
                            imageUploads.some((upload) => upload.isUploading)

                          if (hasContent && !isUploading) {
                            handleSubmit(onSubmit)()
                          }
                        }
                        // Shift+Enter for new line (default behavior)
                      }}
                      placeholder={isMobile ? '' : 'Viết bình luận... (gõ @ để mention người)'}
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

                    {/* Emoji Picker Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`absolute right-12 bottom-3 z-50 shrink-0 transition-colors ${
                        showEmojiPicker ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                      } cursor-pointer`}
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={
                        (!commentInput?.trim() && imageUploads.length === 0) ||
                        createCommentMutation.isPending ||
                        updateCommentMutation.isPending ||
                        imageUploads.some((upload) => upload.isUploading) // Disable if any upload pending
                      }
                      className={`absolute right-3 bottom-3 z-50 shrink-0 transition-colors ${
                        (!commentInput?.trim() && imageUploads.length === 0) ||
                        createCommentMutation.isPending ||
                        updateCommentMutation.isPending ||
                        imageUploads.some((upload) => upload.isUploading)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-900 hover:text-blue-600 cursor-pointer'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cancel Edit Button - shown when editing */}
                  {editingCommentId && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="shrink-0 text-gray-500 hover:text-gray-700"
                      title="Hủy chỉnh sửa"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

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
                {imageUploads.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imageUploads.map((upload, idx) => (
                      <div key={upload.preview} className="relative group">
                        <img
                          src={upload.preview}
                          alt={`Upload ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border border-gray-200"
                        />
                        {/* Upload status indicator */}
                        {upload.isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (upload.preview.startsWith('blob:')) {
                              URL.revokeObjectURL(upload.preview)
                            }
                            setImageUploads((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          disabled={upload.isUploading}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
          <div className="pt-2">
            {isFetching && comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                <p className="text-sm text-muted-foreground font-medium">Đang tải bình luận...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Chưa có bình luận</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Hãy là người đầu tiên chia sẻ ý kiến về công việc này.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {comments.map((c) => (
                  <div
                    key={c.commentId}
                    className="group relative flex gap-3 md:gap-4 py-6 px-1 transition-all duration-200"
                  >
                    <div className="shrink-0 pt-1">
                      <Avatar
                        onClick={() => handleUserClick(c.creator.id)}
                        className="w-9 h-9 md:w-10 md:h-10 cursor-pointer shadow-sm border border-border hover:opacity-90 transition-opacity"
                      >
                        <AvatarImage src={c.creator?.avatar} alt={c.creator?.name} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] md:text-xs font-bold">
                          {c.creator?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-0.5 min-w-0">
                          <span
                            onClick={() => handleUserClick(c.creator.id)}
                            className="font-bold text-[14px] text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                          >
                            {c.creator?.name}
                          </span>
                          <span className="text-[10px] md:text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            <span className="hidden sm:inline-block mr-2 text-muted-foreground">
                              •
                            </span>
                            {dayjs(c.createdTime).fromNow()}
                          </span>
                        </div>

                        {isOwnComment(c.creator.id) && editingCommentId !== c.commentId && (
                          <div
                            className={`flex items-center gap-1 shrink-0 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-all px-1.5"
                              onClick={() => handleStartEdit(c.commentId, c.message, c.imageUrls)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive hover:bg-background rounded-md transition-all px-1.5"
                              onClick={() => handleRemoveComment(c.commentId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="text-[14px] md:text-[15px] text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                        {parseMentionsToHTML(c.message, c.mentionUsers, handleUserClick)}
                      </div>

                      {c.imageUrls && c.imageUrls.length > 0 && (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <PhotoProvider maskOpacity={0.9} speed={() => 300}>
                            {c.imageUrls.map((url: string, idx: number) => (
                              <PhotoView key={url || idx} src={url}>
                                <div className="relative group/photo cursor-zoom-in">
                                  <img
                                    src={url}
                                    alt="attachment"
                                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 object-cover rounded-xl border border-gray-100/10 shadow-sm transition-transform group-hover/photo:scale-[1.02]"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/5 transition-colors rounded-xl" />
                                </div>
                              </PhotoView>
                            ))}
                          </PhotoProvider>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <DialogConfirm
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa bình luận này?"
        description="Hành động này không thể hoàn tác."
      />
    </>
  )
}
