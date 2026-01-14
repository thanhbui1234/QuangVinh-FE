import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'

import { useCreateMember } from '@/hooks/profile/useCreateMember'
import { PersonnelDetailDialog } from '@/components/Personnel'
import { Link, useNavigate } from 'react-router'
import { ROLE } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import { z } from 'zod'
import { motion, type Variants } from 'framer-motion'
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  Sparkles,
} from 'lucide-react'

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
}

export const AddMember = () => {
  const navigate = useNavigate()
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#fcfcfd] dark:bg-[#0c0c0e] relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 h-full flex flex-col relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="pt-6 lg:pt-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/personnel/list')}
            className="group text-muted-foreground hover:text-primary rounded-full pl-2 pr-5 h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Danh sách nhân viên</span>
          </Button>
        </motion.div>

        <div className="flex-1 flex items-center justify-center pb-12 lg:pb-0">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-20 items-center">
            {/* LEFT HERO SECTION */}
            <motion.div
              className="lg:col-span-5 space-y-10 hidden lg:block"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10">
                  <UserPlus className="w-3.5 h-3.5" />
                  Hệ thống nhân sự
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl xl:text-5xl font-black tracking-tighter text-foreground leading-[1.1]">
                    Thêm nhân viên <br />
                    <span className="text-primary flex items-center gap-3">
                      mới vào team
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </span>
                  </h1>
                  <p className="text-muted-foreground text-sm xl:text-base font-medium leading-relaxed max-w-sm">
                    Tạo tài khoản và phân quyền truy cập cho thành viên mới để bắt đầu cộng tác
                    trong dự án.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div className="grid gap-3">
                  {[
                    {
                      title: 'Quản lý công việc',
                      desc: 'Giao việc và theo dõi tiến độ thời gian thực.',
                      color: 'bg-blue-500/10 text-blue-600',
                    },
                    {
                      title: 'Lịch trình cá nhân',
                      desc: 'Tự động tạo lịch nghỉ và chấm công.',
                      color: 'bg-emerald-500/10 text-emerald-600',
                    },
                    {
                      title: 'Bảo mật dữ liệu',
                      desc: 'Phân quyền chi tiết dựa trên vai trò nhiệm vụ.',
                      color: 'bg-amber-500/10 text-amber-600',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-card/40 border border-white dark:border-white/5 backdrop-blur-sm"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground">{item.title}</h4>
                        <p className="text-[11px] font-medium text-muted-foreground opacity-80">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT FORM CARD */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              <Card className="rounded-[2.5rem] lg:rounded-[3rem] bg-white/60 dark:bg-card/40 backdrop-blur-3xl border-white dark:border-white/10 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                <CardContent className="p-8 xl:p-12">
                  <div className="mb-8 text-center space-y-1">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-widest">
                      Thông tin tài khoản
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                      Vui lòng điền chính xác thông tin
                    </p>
                  </div>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* NAME */}
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Tên nhân viên
                        </Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                          <Input
                            className="h-12 pl-12 rounded-xl bg-white/50 border-border/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-bold text-sm"
                            placeholder="Nguyễn Văn A"
                            {...form.register('name')}
                          />
                        </div>
                        {form.formState.errors.name && (
                          <p className="text-rose-500 text-[10px] font-bold ml-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </motion.div>

                      {/* PHONE */}
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Số điện thoại
                        </Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                          <Input
                            className="h-12 pl-12 rounded-xl bg-white/50 border-border/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-bold text-sm"
                            placeholder="09xx xxx xxx"
                            {...form.register('phone')}
                          />
                        </div>
                        {form.formState.errors.phone && (
                          <p className="text-rose-500 text-[10px] font-bold ml-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </motion.div>

                      {/* EMAIL */}
                      <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Địa chỉ Email
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                          <Input
                            className="h-12 pl-12 rounded-xl bg-white/50 border-border/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-bold text-sm"
                            placeholder="nhanvien@congty.com"
                            {...form.register('email')}
                          />
                        </div>
                        {form.formState.errors.email && (
                          <p className="text-rose-500 text-[10px] font-bold ml-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </motion.div>

                      {/* PASSWORD */}
                      <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Mật khẩu tạm thời
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
                          <Input
                            type="password"
                            className="h-12 pl-12 rounded-xl bg-white/50 border-border/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-bold text-sm"
                            placeholder="••••••••"
                            {...form.register('password')}
                          />
                        </div>
                        {form.formState.errors.password && (
                          <p className="text-rose-500 text-[10px] font-bold ml-1">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </motion.div>

                      {/* ROLES */}
                      <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Phân quyền hệ thống
                        </Label>
                        <Controller
                          name="roles"
                          control={form.control}
                          render={({ field }) => (
                            <MultiSelect
                              options={roleOptions}
                              selected={field.value || []}
                              onChange={field.onChange}
                              placeholder="Chọn vai trò"
                              leftIcon={<ShieldCheck className="w-4 h-4" />}
                              className="min-h-12 rounded-xl bg-white/50 border-border/10 focus:border-primary/50 focus:ring-primary/20 transition-all z-10"
                            />
                          )}
                        />
                        {form.formState.errors.roles && (
                          <p className="text-rose-500 text-[10px] font-bold ml-1">
                            {form.formState.errors.roles.message}
                          </p>
                        )}
                      </motion.div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-4">
                      <Button
                        disabled={isPending}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                        type="submit"
                      >
                        {isPending ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang tạo...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            <span>Tạo tài khoản mới</span>
                          </div>
                        )}
                      </Button>
                      <div className="mt-5 text-center">
                        <Link
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-8 decoration-2"
                          to="/personnel/list"
                        >
                          Xem danh sách nhân viên
                        </Link>
                      </div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <PersonnelDetailDialog open={open} onOpenChange={setOpen} user={data?.user || null} />
    </div>
  )
}
