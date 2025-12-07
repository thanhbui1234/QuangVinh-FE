import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ProfileInfoGrid } from '@/components/Profile/ProfileInfoGrid'
import { useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/hooks/profile/useGetProfile'
import { useUpdateName } from '@/hooks/profile/useUpdateName'
import { useUpdateEmail } from '@/hooks/profile/useUpdateEmail'
import { useUpdatePhone } from '@/hooks/profile/useUpdatePhone'
import { useUpdateAvatar } from '@/hooks/profile/useUpdateAvatar'
import { useUploadFile } from '@/hooks/useUploadFile'
import { ProfileSchema, type ProfileFormData } from '@/schemas/profileSchema'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [initialValues, setInitialValues] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Hooks
  const uploadFileMutation = useUploadFile()
  const { updateAvatarMutate } = useUpdateAvatar(currentUserId)
  const { updateNameMutate } = useUpdateName(currentUserId)
  const { updateEmailMutate } = useUpdateEmail(currentUserId)
  const { updatePhoneMutate } = useUpdatePhone(currentUserId)

  // Form
  const { control, reset, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
    },
  })

  const currentValues = watch()

  // Populate form when data loads
  useEffect(() => {
    let data: ProfileFormData
    if (isOwnProfile && user) {
      data = {
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        position: user.roles?.[0] ?? '',
      }
      setAvatarPreview(user.avatar)
    } else if (profile) {
      data = {
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        position: profile.position ?? profile.roles?.[0] ?? '',
      }
      setAvatarPreview(profile.avatar)
    } else {
      return
    }

    reset(data)
    setInitialValues(data)
  }, [isOwnProfile, user, profile, reset])

  const handlePickAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng file phải nhỏ hơn 5MB')
      return
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)

    // Auto upload and update
    uploadFileMutation.mutate(file, {
      onSuccess: (response) => {
        // Update avatar with URL
        updateAvatarMutate(
          { avatar: response.viewUrl },
          {
            onSuccess: () => {
              toast.success('Cập nhật ảnh đại diện thành công')
              // Add cache-busting query param to force browser reload
              const urlWithTimestamp = `${response.viewUrl}?t=${Date.now()}`
              setAvatarPreview(urlWithTimestamp)
              URL.revokeObjectURL(preview)

              // Update authStore immediately for UI refresh
              // Preserve all existing user fields
              if (isOwnProfile && user) {
                useAuthStore.setState({
                  user: {
                    ...user,
                    avatar: response.viewUrl,
                  },
                })
              }
            },
            onError: () => {
              toast.error('Cập nhật ảnh đại diện thất bại')
              // Revert preview on error
              setAvatarPreview(user?.avatar || profile?.avatar)
              URL.revokeObjectURL(preview)
            },
          }
        )
      },
      onError: () => {
        toast.error('Upload ảnh thất bại')
        // Revert preview on error
        setAvatarPreview(user?.avatar || profile?.avatar)
        URL.revokeObjectURL(preview)
      },
    })

    // Reset input
    e.target.value = ''
  }

  const handleUpdateName = () => {
    // Don't update if no change
    if (currentValues.name === initialValues.name) return

    updateNameMutate(
      { name: currentValues.name },
      {
        onSuccess: () => {
          toast.success('Cập nhật tên thành công')
          setInitialValues((prev) => ({ ...prev, name: currentValues.name }))
          // Preserve all existing user fields
          if (isOwnProfile && user) {
            useAuthStore.setState({
              user: {
                ...user,
                name: currentValues.name,
              },
            })
          }
        },
        onError: () => toast.error('Cập nhật tên thất bại'),
      }
    )
  }

  const handleUpdateEmail = () => {
    // Don't update if no change
    if (currentValues.email === initialValues.email) return

    updateEmailMutate(
      { email: currentValues.email },
      {
        onSuccess: () => {
          toast.success('Cập nhật email thành công')
          setInitialValues((prev) => ({ ...prev, email: currentValues.email }))
          // Preserve all existing user fields
          if (isOwnProfile && user) {
            useAuthStore.setState({
              user: {
                ...user,
                email: currentValues.email,
              },
            })
          }
        },
        onError: () => toast.error('Cập nhật email thất bại'),
      }
    )
  }

  const handleUpdatePhone = () => {
    // Don't update if no change
    if (currentValues.phone === initialValues.phone) return

    updatePhoneMutate(
      { phone: currentValues.phone || '' },
      {
        onSuccess: () => {
          toast.success('Cập nhật số điện thoại thành công')
          setInitialValues((prev) => ({ ...prev, phone: currentValues.phone || '' }))
          // Preserve all existing user fields
          if (isOwnProfile && user) {
            useAuthStore.setState({
              user: {
                ...user,
                phone: currentValues.phone || '',
              },
            })
          }
        },
        onError: () => toast.error('Cập nhật số điện thoại thất bại'),
      }
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isUploading = uploadFileMutation.isPending

  // Check if field has changed
  const hasNameChanged = currentValues.name !== initialValues.name
  const hasEmailChanged = currentValues.email !== initialValues.email
  const hasPhoneChanged = currentValues.phone !== initialValues.phone

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

      {/* Profile Content */}
      <div className="mx-auto -mt-24 flex w-full max-w-3xl flex-col items-center px-4 pb-12">
        {/* Avatar Section */}
        <div className="relative mb-6">
          <Avatar className="size-32 ring-4 ring-white shadow-xl">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="Avatar" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl">
                {currentValues.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>

          {isOwnProfile && (
            <Button
              size="icon"
              className="absolute bottom-0 right-0 rounded-full shadow-lg"
              onClick={handlePickAvatar}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="text-lg">📷</span>
              )}
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Name Display */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{currentValues.name || 'Người dùng'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentValues.position || 'Chưa cập nhật chức vụ'}
          </p>
        </div>

        {/* Info Grid - Using FormInlineField like before */}
        <div className="w-full">
          <ProfileInfoGrid
            control={control}
            isOwnProfile={isOwnProfile}
            isLoading={isFetching}
            isSaving={false}
            onUpdateField={(field) => {
              switch (field) {
                case 'name':
                  handleUpdateName()
                  break
                case 'email':
                  handleUpdateEmail()
                  break
                case 'phone':
                  handleUpdatePhone()
                  break
              }
            }}
            // Pass dirty state to conditionally show buttons
            hasNameChanged={hasNameChanged}
            hasEmailChanged={hasEmailChanged}
            hasPhoneChanged={hasPhoneChanged}
          />
        </div>

        {/* Logout Button */}
        {isOwnProfile && (
          <div className="mt-8 w-full max-w-md">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
