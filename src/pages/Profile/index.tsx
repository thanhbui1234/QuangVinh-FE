import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { ProfileHeader, ProfileInfoGrid } from '@/components/Profile'
import { useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/hooks/profile/useGetProfile'
import { useUpdateProfile } from '@/hooks/profile/useUpdateProfile'
import { ProfileSchema, type ProfileFormData } from '@/schemas/profileSchema'

export const Profile = () => {
  const { id } = useParams()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const isOwnProfile = useMemo(() => !id || id === user?.id.toString(), [id, user?.id])
  const currentUserId = useMemo(
    () => (isOwnProfile ? user?.id : id) || 0,
    [isOwnProfile, id, user?.id]
  )

  // Fetch profile data
  const { profile, isFetching } = useGetProfile(currentUserId)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Mutation
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile(currentUserId)

  // Form
  const { control, reset, getValues } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (isOwnProfile && user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        position: user.roles?.[0] ?? '',
      })
      setAvatarUrl(user.avatar)
    } else if (profile) {
      reset({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        position: profile.position ?? profile.roles?.[0] ?? '',
      })
      setAvatarUrl(profile.avatar)
    }
  }, [isOwnProfile, user, profile, reset])

  const handlePickAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)
  }

  const handleUpdateAvatar = () => {
    if (!avatarFile) return
    const formData = getValues()
    updateProfile({ ...formData, avatar: avatarFile })
    setAvatarFile(null)
  }

  const handleUpdateField = () => {
    const formData = getValues()
    updateProfile(formData)
  }

  const handleLogout = () => {
    navigate('/login')
    logout()
  }

  return (
    <div className="w-full">
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        avatarUrl={avatarUrl}
        isSaving={isSaving}
        hasNewFile={!!avatarFile}
        onPickAvatar={handlePickAvatar}
        onUpdateAvatar={handleUpdateAvatar}
        onUpdateName={handleUpdateField}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4">
        <ProfileInfoGrid
          control={control}
          isOwnProfile={isOwnProfile}
          isLoading={isFetching}
          isSaving={isSaving}
          onUpdateField={handleUpdateField}
        />

        {isOwnProfile ? (
          <div className="mt-2 flex items-center gap-3">
            <Button variant="destructive" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
