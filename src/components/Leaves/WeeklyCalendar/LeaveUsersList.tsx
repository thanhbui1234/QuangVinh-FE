import { useMemo } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/utils/CommonUtils'
import type { LeavesListDataResponse } from '@/types/Leave.ts'
import dayjs from 'dayjs'
import { isDateInLeaveRange } from './utils'

interface LeaveUsersListProps {
  date: Date
  leaves: LeavesListDataResponse[]
  onClose: () => void
  variant?: 'mobile' | 'web'
}

export function LeaveUsersList({ date, leaves, variant = 'mobile' }: LeaveUsersListProps) {
  const usersOnLeave = useMemo(() => {
    return leaves.filter((leave) => isDateInLeaveRange(date, leave))
  }, [date, leaves])

  const formatDate = (date: Date) => {
    return dayjs(date).format('DD/MM/YYYY')
  }

  if (usersOnLeave.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Ngày {formatDate(date)} có {usersOnLeave.length} người nghỉ:
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {usersOnLeave.map((leave) => {
          const creator = leave.creator
          if (!creator) return null

          return (
            <div
              key={leave.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Avatar className={variant === 'web' ? 'h-12 w-12' : 'h-10 w-10'}>
                {creator.avatar ? <AvatarImage src={creator.avatar} alt={creator.name} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(creator.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{creator.name}</div>
                <div className="text-sm text-muted-foreground truncate">{creator.email}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
