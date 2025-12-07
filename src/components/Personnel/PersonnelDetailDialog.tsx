import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye } from 'lucide-react'
import type { PersonnelUser } from '@/types/Personnel'
import { PersonnelRoleBadges } from './PersonnelRoleBadges'
import { formatTimestampToDate, getInitials } from '@/utils/CommonUtils'

type PersonnelDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: PersonnelUser | null
}

export const PersonnelDetailDialog = ({ open, onOpenChange, user }: PersonnelDetailDialogProps) => {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" animationVariant="fade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5" />
            Chi tiết nhân viên
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về nhân viên</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Name Section */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-20 w-20">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Số điện thoại</Label>
              <p className="font-medium">{user.phone || 'N/A'}</p>
            </div>

            <div className="space-y-1 col-span-2">
              <Label className="text-muted-foreground">Vai trò</Label>
              <div className="mt-1">
                <PersonnelRoleBadges roles={user.roles} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Ngày tạo</Label>
              <p className="font-medium">{formatTimestampToDate(user.createdTime)}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground">Ngày cập nhật</Label>
              <p className="font-medium">{formatTimestampToDate(user.updatedTime)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
