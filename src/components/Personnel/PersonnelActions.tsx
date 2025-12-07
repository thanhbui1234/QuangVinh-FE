import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PersonnelActionsProps {
  userId: string | number
  onView: (userId: string) => void
}

export const PersonnelActions = ({ userId, onView }: PersonnelActionsProps) => {
  const userIdString = userId.toString()

  return (
    <div className="flex items-center justify-center w-full" onClick={(e) => e.stopPropagation()}>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          onView(userIdString)
        }}
        className="h-8 w-8 p-0 flex items-center justify-center"
        title="Xem chi tiết"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}
