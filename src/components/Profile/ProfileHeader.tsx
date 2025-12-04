import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FormInlineField } from './FormInlineField'
import type { Control } from 'react-hook-form'
import type { ProfileFormData } from '@/schemas/profileSchema'

interface ProfileHeaderProps {
  control: Control<ProfileFormData>
  isOwnProfile: boolean
  avatarUrl?: string
  isSaving?: boolean
  hasNewFile?: boolean
  onPickAvatar: () => void
  onUpdateAvatar?: () => void
  onUpdateName: () => void
}

export const ProfileHeader = ({
  control,
  isOwnProfile,
  avatarUrl,
  isSaving,
  hasNewFile,
  onPickAvatar,
  onUpdateAvatar,
  onUpdateName,
}: ProfileHeaderProps) => {
  return (
    <>
      {/* Cover Image */}
      <div className="h-44 w-full rounded-b-md bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900" />

      {/* Profile Content */}
      <div className="mx-auto -mt-12 flex w-full max-w-3xl flex-col items-center px-4">
        {/* Avatar Section */}
        <div className="relative">
          <Avatar className="size-28 ring-4 ring-white dark:ring-slate-950">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="avatar" />
            ) : (
              <AvatarImage src="photo_2025-09-26_12-28-54.jpg" alt="avatar" />
            )}
          </Avatar>
          {isOwnProfile ? (
            <Button
              type="button"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={onPickAvatar}
              variant="secondary"
            >
              Đổi ảnh
            </Button>
          ) : null}
          {isOwnProfile && hasNewFile ? (
            <div className="absolute -bottom-10 right-0 flex gap-2">
              <Button size="sm" onClick={onUpdateAvatar} disabled={isSaving}>
                Cập nhật ảnh
              </Button>
            </div>
          ) : null}
        </div>

        {/* Name Field */}
        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <div className="relative w-full max-w-md">
            <FormInlineField
              control={control}
              name="name"
              placeholder="Tên hiển thị"
              disabled={!isOwnProfile}
              saving={isSaving}
              onUpdate={onUpdateName}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileHeader
