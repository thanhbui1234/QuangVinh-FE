import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface AvatarEditorProps {
  isOwnProfile: boolean
  avatarUrl?: string
  isSaving?: boolean
  hasNewFile?: boolean
  onPick: () => void
  onUpdate?: () => void
}

export const AvatarEditor = ({
  isOwnProfile,
  avatarUrl,
  isSaving,
  hasNewFile,
  onPick,
  onUpdate,
}: AvatarEditorProps) => {
  return (
    <div className="relative">
      <Avatar className="size-28 ring-4 ring-white dark:ring-slate-950">
        {avatarUrl ? (
          <AvatarImage src={'photo_2025-09-26_12-28-54.jpg'} alt="avatar" />
        ) : (
          <AvatarImage src={'photo_2025-09-26_12-28-54.jpg'} alt="avatar" />
        )}
      </Avatar>
      {isOwnProfile ? (
        <Button
          type="button"
          size="sm"
          className="absolute bottom-0 right-0 rounded-full"
          onClick={onPick}
          variant="secondary"
        >
          Đổi ảnh
        </Button>
      ) : null}
      {isOwnProfile && hasNewFile ? (
        <div className="absolute -bottom-10 right-0 flex gap-2">
          <Button size="sm" onClick={onUpdate} disabled={isSaving}>
            Cập nhật ảnh
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default AvatarEditor
