import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { initOneSignal, checkSubscriptionStatus } from '@/service/onesignalService/initOnesignal'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export const Profile = () => {
  const { id } = useParams()
  const { user, logout, setUser } = useAuthStore()
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
  const [isNotificationsOn, setIsNotificationsOn] = useState(false)
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isUploadingRef = useRef(false)

  const uploadFileMutation = useUploadFile()
  const { updateAvatarMutate } = useUpdateAvatar(currentUserId)
  const { updateNameMutate } = useUpdateName(currentUserId)
  const { updateEmailMutate } = useUpdateEmail(currentUserId)
  const { updatePhoneMutate } = useUpdatePhone(currentUserId)

  const { control, reset, watch, trigger } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
    },
  })

  const currentValues = watch()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkStatus = async () => {
      try {
        // Only check if OneSignal is already loaded
        if (window.OneSignal) {
          const isSubscribed = await checkSubscriptionStatus()
          setIsNotificationsOn(isSubscribed)
        } else {
          // Fallback to browser permission check
          if ('Notification' in window && Notification.permission === 'granted') {
            setIsNotificationsOn(true)
          } else {
            setIsNotificationsOn(false)
          }
        }
      } catch (error) {
        console.error('Error checking notification status:', error)
        setIsNotificationsOn(false)
      }
    }

    checkStatus()
  }, [])

  // Sync avatar preview only when user/profile ID or avatar URL changes
  useEffect(() => {
    if (isUploadingRef.current) {
      return
    }

    if (isOwnProfile && profile?.avatar) {
      setAvatarPreview(profile?.avatar)
    }
  }, [isOwnProfile, profile?.id, profile?.avatar])

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
    } else if (profile) {
      data = {
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        position: profile.position ?? profile.roles?.[0] ?? '',
      }
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

    // Show preview immediately with local blob URL
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    isUploadingRef.current = true

    // Auto upload and update
    uploadFileMutation.mutate(file, {
      onSuccess: (response) => {
        updateAvatarMutate(
          { avatar: response.viewUrl },
          {
            onSuccess: () => {
              toast.success('Cập nhật ảnh đại diện thành công')

              // Add cache-busting to ensure fresh image from server
              const serverUrl = `${response.viewUrl}${response.viewUrl.includes('?') ? '&' : '?'}t=${Date.now()}`

              // Preload the server image before switching to ensure it's ready
              const img = new Image()
              img.onload = () => {
                // Only switch to server URL after it's successfully loaded
                setAvatarPreview(response.viewUrl)

                // Update store (will trigger useEffect but it will be skipped due to isUploadingRef)
                if (user) {
                  setUser({ ...user, avatar: response.viewUrl })
                }

                // Clean up blob URL after server image is confirmed to work
                URL.revokeObjectURL(preview)

                // Reset flag after state updates have been flushed
                queueMicrotask(() => {
                  console.log('Resetting upload flag')
                  isUploadingRef.current = false
                })
              }
              img.onerror = () => {
                console.error('Failed to load server image, keeping blob preview')
                // Keep the blob preview if server image fails to load
                // But still update the store with server URL for future page loads
                if (user) {
                  setUser({ ...user, avatar: response.viewUrl })
                }

                // Don't revoke blob URL yet since it's still being used
                // It will be cleaned up on next avatar change or page unload
                queueMicrotask(() => {
                  isUploadingRef.current = false
                })
              }
              // Start loading the server image
              img.src = serverUrl
            },
            onError: () => {
              toast.error('Cập nhật ảnh đại diện thất bại')
              // Revert preview on error
              setAvatarPreview(profile?.avatar || user?.avatar)
              URL.revokeObjectURL(preview)
              isUploadingRef.current = false
            },
          }
        )
      },
      onError: () => {
        toast.error('Upload ảnh thất bại')
        // Revert preview on error
        setAvatarPreview(profile?.avatar || user?.avatar)
        URL.revokeObjectURL(preview)
        isUploadingRef.current = false
      },
    })

    // Reset input
    e.target.value = ''
  }

  const handleUpdateName = async () => {
    // Don't update if no change
    if (currentValues.name === initialValues.name) return

    // Validate name field before calling API
    const isValid = await trigger('name')
    if (!isValid) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

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

  const handleUpdateEmail = async () => {
    // Don't update if no change
    if (currentValues.email === initialValues.email) return

    // Validate email field before calling API
    const isValid = await trigger('email')
    if (!isValid) {
      toast.error('Email không hợp lệ')
      return
    }

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

  const handleUpdatePhone = async () => {
    // Don't update if no change
    if (currentValues.phone === initialValues.phone) return

    // Validate phone field before calling API
    const isValid = await trigger('phone')
    if (!isValid) {
      toast.error('Số điện thoại không hợp lệ')
      return
    }

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

  const handleToggleNotifications = async (checked: boolean) => {
    if (!checked) {
      setIsNotificationsOn(false)
      toast.info('Bạn có thể bật lại thông báo bất cứ lúc nào.')
      return
    }

    setIsRequestingNotifications(true)
    try {
      const success = await initOneSignal()
      console.log('succe123123612736712ss', success)
      if (success) {
        // Verify subscription status
        const isSubscribed = await checkSubscriptionStatus()
        setIsNotificationsOn(isSubscribed)

        if (isSubscribed) {
          toast.success('Đã bật thông báo đẩy thành công')
        } else {
          toast.warning('Thông báo chưa được kích hoạt. Vui lòng thử lại.')
        }
      } else {
        setIsNotificationsOn(false)
      }
    } catch (error) {
      console.error('initOneSignal error', error)
      setIsNotificationsOn(false)
      toast.error('Không thể khởi tạo thông báo. Vui lòng thử lại sau.')
    } finally {
      setIsRequestingNotifications(false)
    }
  }

  const isUploading = uploadFileMutation.isPending

  // Check if field has changed
  const hasNameChanged = currentValues.name !== initialValues.name
  const hasEmailChanged = currentValues.email !== initialValues.email
  const hasPhoneChanged = currentValues.phone !== initialValues.phone

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="px-4 pt-4">
        <PageBreadcrumb />
      </div>
      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

      {/* Profile Content */}
      <div className="mx-auto -mt-24 flex w-full max-w-3xl flex-col items-center px-4 pb-12">
        {/* Avatar Section */}
        <div className="relative mb-6">
          <Avatar className="size-32 ring-4 ring-white shadow-xl">
            <AvatarImage src={avatarPreview} alt="Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl">
              {currentValues.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
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
          <p className="text-xl text-gray-500 mt-1">
            {currentValues.position === 'WORKER'
              ? 'STAFF'
              : currentValues.position === 'MANAGER'
                ? 'MANAGER'
                : 'DIRECTOR'}
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
          <div className="mt-8 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-900">Nhận thông báo</p>
                <p className="text-xs text-gray-500">Bật để nhận thông báo đẩy từ hệ thống</p>
              </div>
              <Switch
                checked={isNotificationsOn}
                disabled={isRequestingNotifications}
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            <Button variant="destructive" onClick={handleLogout} className="w-full">
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
