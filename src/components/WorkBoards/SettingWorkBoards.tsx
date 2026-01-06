import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'

export const SettingWorkBoards = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: () => any
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-lg font-semibold text-gray-800">Cài đặt bảng</DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-6 py-4">Cài đặt bảng</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
