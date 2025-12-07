import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/constants'

const roleLabels: Record<UserRole, string> = {
  DIRECTOR: 'Giám đốc',
  MANAGER: 'Quản lý',
  WORKER: 'Nhân viên',
}

const roleVariants: Record<UserRole, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  DIRECTOR: 'destructive',
  MANAGER: 'default',
  WORKER: 'secondary',
}

interface PersonnelRoleBadgesProps {
  roles?: UserRole[]
}

export const PersonnelRoleBadges = ({ roles }: PersonnelRoleBadgesProps) => {
  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role} variant={roleVariants[role]}>
          {roleLabels[role]}
        </Badge>
      ))}
    </div>
  )
}
