import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { DialogClose, DialogDescription, DialogFooter } from '../ui/dialog'

export const SettingWorkBoards = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: () => any
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cài đặt bảng</DialogTitle>
          <DialogDescription>Cài đặt bảng</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onOpenChange}>Continue</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
