import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SwitchMode } from '@/components/ui/switchMode'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ProfileInfoGrid } from '@/components/Profile/ProfileInfoGrid'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/hooks/profile/useGetProfile'
import { useUpdateName } from '@/hooks/profile/useUpdateName'
import { useUpdateEmail } from '@/hooks/profile/useUpdateEmail'
import { useUpdatePhone } from '@/hooks/profile/useUpdatePhone'
import { useUpdateAvatar } from '@/hooks/profile/useUpdateAvatar'
import { useUploadFile } from '@/hooks/useUploadFile'
import { ProfileSchema, type ProfileFormData } from '@/schemas/profileSchema'
import { toast } from 'sonner'
import { Loader2, Camera, User as UserIcon, Settings, LogOut, Bell, Palette } from 'lucide-react'
import {
  getSubscriptionStatus,
  setNotificationEnabled,
} from '@/service/onesignalService/initOnesignal'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { NotificationPermissionDialog } from '@/components/Profile/NotificationPermissionDialog'

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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
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
      const isEnabled = await getSubscriptionStatus()
      setIsNotificationsOn(isEnabled)
    }

    // Check immediately and poll a few times just to be sure (SDK lazy load)
    checkStatus()
    const t1 = setTimeout(checkStatus, 1000)
    const t2 = setTimeout(checkStatus, 3000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Sync avatar preview only when user/profile ID or avatar URL changes
  useEffect(() => {
    if (isUploadingRef.current) {
      return
    }

    if (isOwnProfile && profile?.avatar) {
      setAvatarPreview(profile?.avatar)
    } else {
      setAvatarPreview(profile?.avatar)
    }
  }, [isOwnProfile, profile?.id, profile?.avatar, user?.avatar])

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
    // Nếu user tắt thông báo, gọi trực tiếp
    if (!checked) {
      setIsRequestingNotifications(true)
      try {
        const success = await setNotificationEnabled(false)
        setIsNotificationsOn(success)
        if (!success) {
          toast.info('Đã tắt thông báo')
        }
      } catch (error) {
        console.error('Toggle notification error', error)
        toast.error('Có lỗi xảy ra, vui lòng thử lại.')
        setIsNotificationsOn(true)
      } finally {
        setIsRequestingNotifications(false)
      }
      return
    }

    // Nếu user bật thông báo, kiểm tra permission
    const currentPermission = Notification.permission

    // Nếu permission đã granted, gọi trực tiếp
    if (currentPermission === 'granted') {
      setIsRequestingNotifications(true)
      try {
        const success = await setNotificationEnabled(true)
        setIsNotificationsOn(success)
        if (success) {
          toast.success('Đã bật thông báo')
        } else {
          toast.error('Không thể bật thông báo. Vui lòng thử lại.')
        }
      } catch (error) {
        console.error('Toggle notification error', error)
        toast.error('Có lỗi xảy ra, vui lòng thử lại.')
        setIsNotificationsOn(false)
      } finally {
        setIsRequestingNotifications(false)
      }
      return
    }

    // Nếu permission bị denied, hiển thị thông báo lỗi
    if (currentPermission === 'denied') {
      toast.error(
        'Thông báo bị chặn. Vui lòng vào Cài đặt thiết bị > Chọn ứng dụng này > Bật thông báo.'
      )
      setIsNotificationsOn(false)
      return
    }

    // Nếu permission là 'default' (chưa được hỏi), hiển thị popup custom
    setShowPermissionDialog(true)
    // Tạm thời không cập nhật switch state, đợi user chọn trong dialog
  }

  const handleAllowNotification = async () => {
    setIsRequestingNotifications(true)
    try {
      const success = await setNotificationEnabled(true)
      setIsNotificationsOn(success)

      if (success) {
        toast.success('Đã bật thông báo')
      } else {
        // Kiểm tra lại permission sau khi request
        if (Notification.permission === 'denied') {
          toast.error(
            'Thông báo bị chặn. Vui lòng vào Cài đặt thiết bị > Chọn ứng dụng này > Bật thông báo.'
          )
        } else {
          toast.error('Không thể bật thông báo. Vui lòng thử lại.')
        }
        setIsNotificationsOn(false)
      }
    } catch (error) {
      console.error('Enable notification error', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
      setIsNotificationsOn(false)
    } finally {
      setIsRequestingNotifications(false)
    }
  }

  const handleDenyNotification = () => {
    setIsNotificationsOn(false)
    // Không cần làm gì thêm, chỉ đóng dialog
  }

  const isUploading = uploadFileMutation.isPending

  // Check if field has changed
  const hasNameChanged = currentValues.name !== initialValues.name
  const hasEmailChanged = currentValues.email !== initialValues.email
  const hasPhoneChanged = currentValues.phone !== initialValues.phone

  return (
    <div className="w-full min-h-screen bg-[#fcfcfd] dark:bg-[#0c0c0e] pb-10">
      <div className="px-6 py-4">
        <PageBreadcrumb />
      </div>

      {/* Hero Header Section - Reduced Height */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fcfcfd] dark:from-[#0c0c0e] to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="mx-auto -mt-24 relative z-10 w-full max-w-3xl px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white/70 dark:bg-card/40 backdrop-blur-2xl border border-white dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* Profile Header Card - Centered Layout */}
          <div className="p-8 pb-6 flex flex-col items-center border-b border-border/5">
            <div className="relative group">
              <PhotoProvider maskOpacity={0.9} speed={() => 300}>
                <PhotoView src={avatarPreview}>
                  <Avatar className="size-32 ring-8 ring-white/50 dark:ring-white/5 shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-500">
                    <AvatarImage src={avatarPreview} alt="Avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-black">
                      {currentValues.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </PhotoView>
              </PhotoProvider>

              {isOwnProfile && (
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 size-10 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-110 active:scale-95 border-4 border-white dark:border-[#1c1c1e]"
                  onClick={handlePickAvatar}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="size-4.5 animate-spin" />
                  ) : (
                    <Camera className="size-4.5" />
                  )}
                </Button>
              )}
            </div>

            <div className="mt-6 text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {currentValues.name || 'Người dùng'}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-0.5 rounded-full uppercase tracking-widest text-[9px]"
                >
                  {currentValues.position === 'WORKER'
                    ? 'Staff Member'
                    : currentValues.position === 'MANAGER'
                      ? 'System Manager'
                      : 'Executive Director'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Settings Grid - Compact items */}
          <div className="p-6 sm:p-8 space-y-10">
            {/* Basic Info Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <UserIcon className="size-3.5 text-blue-500" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Thông tin cơ bản
                </h2>
              </div>

              <div className="bg-muted/10 dark:bg-muted/5 rounded-[1.8rem] p-4 sm:p-6 border border-border/5">
                <ProfileInfoGrid
                  control={control}
                  isOwnProfile={isOwnProfile}
                  isLoading={isFetching}
                  isSaving={false}
                  onUpdateField={(field: 'name' | 'email' | 'phone' | 'position') => {
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
                  hasNameChanged={hasNameChanged}
                  hasEmailChanged={hasEmailChanged}
                  hasPhoneChanged={hasPhoneChanged}
                />
              </div>
            </section>

            {/* Account Settings Section */}
            {isOwnProfile && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <Settings className="size-3.5 text-indigo-500" />
                  </div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Thiết lập hệ thống
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-card border border-border/10 shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl group-hover:scale-105 transition-transform">
                        <Bell className="size-4.5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Thông báo đẩy</p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Thời gian thực
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isNotificationsOn}
                      disabled={isRequestingNotifications}
                      onCheckedChange={handleToggleNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-card border border-border/10 shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform">
                        <Palette className="size-4.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Chế độ hiển thị</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Sáng / Tối</p>
                      </div>
                    </div>
                    <SwitchMode />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/5 flex flex-col items-center">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-12 w-full max-w-xs rounded-2xl text-rose-500 hover:bg-rose-500/5 font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 group border border-rose-500/10 shadow-sm"
                  >
                    <LogOut className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Đăng xuất khỏi hệ thống
                  </Button>
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Custom Notification Permission Dialog */}
      <NotificationPermissionDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onAllow={handleAllowNotification}
        onDeny={handleDenyNotification}
      />
    </div>
  )
}
