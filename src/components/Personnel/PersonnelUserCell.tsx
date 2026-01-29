import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/utils/CommonUtils'

interface PersonnelUserCellProps {
  name: string
  email: string
  avatar?: string
}

export const PersonnelUserCell = ({ name, email, avatar }: PersonnelUserCellProps) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {avatar ? <AvatarImage className={'object-cover'} src={avatar} alt={name} /> : null}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>
    </div>
  )
}
