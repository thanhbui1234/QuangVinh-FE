'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'

import { useCreateMember } from '@/hooks/profile/useCreateMember'
import { PersonnelDetailDialog } from '@/components/Personnel'
import { Link } from 'react-router'
import { ROLE } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import { z } from 'zod'

// Helper function to get the highest role of current user
const getHighestRole = (userRoles?: string[]): string | null => {
  if (!userRoles || userRoles.length === 0) return null
  if (userRoles.includes(ROLE.DIRECTOR)) return ROLE.DIRECTOR
  if (userRoles.includes(ROLE.MANAGER)) return ROLE.MANAGER
  if (userRoles.includes(ROLE.WORKER)) return ROLE.WORKER
  return null
}

// Helper function to get allowed roles based on current user's role
const getAllowedRoles = (currentUserRole: string | null): string[] => {
  if (currentUserRole === ROLE.DIRECTOR) {
    return [ROLE.MANAGER, ROLE.WORKER]
  }
  if (currentUserRole === ROLE.MANAGER) {
    return [ROLE.WORKER]
  }
  return [] // WORKER cannot create any user
}

export const AddMember = () => {
  const { createMemberMutate, isPending, data } = useCreateMember()
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()

  // Get current user's highest role and allowed roles
  const currentUserHighestRole = useMemo(() => getHighestRole(user?.roles), [user?.roles])
  const allowedRoles = useMemo(
    () => getAllowedRoles(currentUserHighestRole),
    [currentUserHighestRole]
  )

  // Create dynamic schema based on allowed roles
  const createMemberSchema = useMemo(() => {
    return z.object({
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(1, 'Mật khẩu là bắt buộc'),
      name: z.string().min(1, 'Tên nhân viên là bắt buộc'),
      phone: z
        .string()
        .min(1, 'Số điện thoại là bắt buộc')
        .regex(
          /^(?:\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
          'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam'
        ),
      roles: z
        .array(z.enum([ROLE.DIRECTOR, ROLE.MANAGER, ROLE.WORKER]))
        .min(1, 'Vui lòng chọn ít nhất một vai trò')
        .refine(
          (roles) => {
            if (!currentUserHighestRole) return false
            return roles.every((role) => allowedRoles.includes(role))
          },
          {
            message:
              'Bạn không có quyền chọn vai trò này. Chỉ có thể chọn vai trò nhỏ hơn vai trò của bạn.',
          }
        ),
    })
  }, [allowedRoles, currentUserHighestRole])

  type CreateMemberFormData = z.infer<typeof createMemberSchema>

  const form = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      roles: [],
    },
  })

  // Filter role options based on allowed roles
  const roleOptions = useMemo(() => {
    const allRoles = [
      { label: 'STAFF', value: ROLE.WORKER },
      { label: 'MANAGER', value: ROLE.MANAGER },
      { label: 'DIRECTOR', value: ROLE.DIRECTOR },
    ]
    return allRoles.filter((role) => allowedRoles.includes(role.value))
  }, [allowedRoles])

  const onSubmit = (data: CreateMemberFormData) => {
    createMemberMutate(data, {
      onSuccess: () => {
        setOpen(true)
        form.reset()
      },
    })
  }

  return (
    <div className="w-full h-full flex justify-center items-center px-10 py-10">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
        {/* LEFT HERO SECTION */}
        <div>
          <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4">
            Nhân viên mới
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Thêm nhân viên mới</h1>

          <p className="mt-4 text-muted-foreground text-lg">
            Tạo tài khoản cho nhân viên mới. Họ sẽ có quyền truy cập vào hệ thống.
          </p>

          <ul className="mt-6 space-y-3 text-muted-foreground">
            <li>• Tạo đơn xin nghỉ</li>
            <li>• Xem công việc</li>
            <li>• Tài liệu</li>
          </ul>
        </div>

        {/* RIGHT FORM CARD */}
        <Card className="shadow-xl border border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">Tạo tài khoản</CardTitle>
            <p className="text-sm text-muted-foreground">Nhập thông tin để tạo tài khoản</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* NAME */}
              <div className="space-y-2">
                <Label>Tên nhân viên</Label>
                <Input
                  className="h-11"
                  placeholder="Nhập tên nhân viên"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  className="h-11"
                  placeholder="user@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input className="h-11" placeholder="0123456789" {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  className="h-11"
                  placeholder=""
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* ROLES */}
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Controller
                  name="roles"
                  control={form.control}
                  render={({ field }) => (
                    <MultiSelect
                      options={roleOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Chọn vai trò"
                    />
                  )}
                />
                {form.formState.errors.roles && (
                  <p className="text-red-500 text-sm">{form.formState.errors.roles.message}</p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <Button disabled={isPending} className="w-full h-11" type="submit">
                {isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
              <Link className="text-blue-500 hover:underline" to="/personnel/list">
                Xem danh sách nhân viên
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>

      <PersonnelDetailDialog open={open} onOpenChange={setOpen} user={data?.user || null} />
    </div>
  )
}
