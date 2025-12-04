import { Card, CardContent } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'

export const MobileBar = ({
  assignee,
  setInfoOpen,
}: {
  assignee: any
  setInfoOpen: (open: boolean) => void
}) => {
  return (
    <>
      <div className="lg:hidden">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={assignee?.avatar} />
                  <AvatarFallback>{assignee?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500">Người được giao</div>
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {assignee?.name || 'Chưa gán'}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setInfoOpen(true)}>
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
