import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { IMemberTask } from '@/hooks/assignments/useGetMemberTask'
import { MessageCircle, Send } from 'lucide-react'
import { MentionsInput, Mention } from 'react-mentions'
import type { SuggestionDataItem } from 'react-mentions'
import { useForm } from 'react-hook-form'
import { useCreateComment } from '@/hooks/assignments/comments/useCreateComment'
import SonnerToaster from '@/components/ui/toaster'
import { useNavigate } from 'react-router'
import { parseMentionsToHTML } from '@/utils/mentions'
import { useGetListComments } from '@/hooks/assignments/comments/useGetListComments'

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
      border: '1px solid transparent',
    },
    input: {
      padding: 9,
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
  const { comments, isFetching } = useGetListComments(taskId)
  const createCommentMutation = useCreateComment()
  const navigate = useNavigate()

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

  // Extract mention IDs from plain @mentions in message
  // Message format: "@Alice @Bob some text"
  // We need to match @names with member list to get IDs
  const extractMentionIds = (message: string): number[] => {
    const mentionRegex = /@(\w+)/g
    const mentionIds: number[] = []
    let match

    while ((match = mentionRegex.exec(message)) !== null) {
      const mentionedName = match[1]
      // Find user in member list by name
      const user = member?.find(
        (m) => m.name === mentionedName || m.email?.split('@')[0] === mentionedName
      )
      if (user && !mentionIds.includes(Number(user.id))) {
        mentionIds.push(Number(user.id))
      }
    }

    return mentionIds
  }

  const onSubmit = async (data: CommentFormData) => {
    if (!data.message.trim()) return

    // Convert @[Name](ID) format to plain @Name for backend
    const plainMessage = data.message.replace(/@\[([^\]]+)\]\((\d+)\)/g, '@$1')
    const mentionIds = extractMentionIds(data.message)

    try {
      await createCommentMutation.mutateAsync({
        taskId: taskId,
        message: plainMessage,
        commentType: 1, // Default value
        mentionIds: mentionIds,
      })

      // Reset form
      reset()

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
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <MentionsInput
                    value={commentInput}
                    onChange={(e) => {
                      setValue('message', e.target.value)
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
                </div>
                <Button
                  size="icon"
                  type="submit"
                  disabled={!commentInput?.trim() || createCommentMutation.isPending}
                  className="shrink-0 bg-gray-900 hover:bg-gray-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
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
                <div key={c.commentId} className="flex gap-3">
                  <Avatar
                    onClick={() => handleUserClick(c.creator.id)}
                    className="w-9 h-9 shrink-0 cursor-pointer"
                  >
                    <AvatarImage src={c.creator?.avatar} alt={c.creator?.name} />
                    <AvatarFallback>{c.creator?.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
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
                            className="max-w-xs rounded border border-gray-200 cursor-pointer hover:opacity-90"
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
    </>
  )
}
