'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCreateMember } from '@/hooks/profile/useCreateMember'
import type { CreateMemberFormData } from '@/types'
import { createMemberSchema } from '@/schemas/Auth'
import { PersonnelDetailDialog } from '@/components/Personnel'
import { Link } from 'react-router'

export const AddMember = () => {
  const { createMemberMutate, isPending, data } = useCreateMember()
  const [open, setOpen] = useState(false)
  const form = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

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
