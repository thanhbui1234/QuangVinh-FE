import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Save, AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDeleteWorkBoard } from '@/hooks/workBoards/useDeleteWorkBoard'
import { useUpdateNameWB } from '@/hooks/workBoards/useUpdateNameWB'

interface SettingWorkBoardsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sheetId: any
  currentName: string
}

export const SettingWorkBoards = ({
  open,
  onOpenChange,
  sheetId,
  currentName,
}: SettingWorkBoardsProps) => {
  const navigate = useNavigate()
  const [name, setName] = useState(currentName)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Update name state when prop changes
  useEffect(() => {
    if (open) {
      setName(currentName)
      setShowDeleteConfirm(false)
    }
  }, [open, currentName])

  // Hooks
  const { deleteWorkBoardMutation } = useDeleteWorkBoard({ sheetId })
  const updateNameMutation = useUpdateNameWB()

  const handleUpdateName = () => {
    if (!name?.trim() || name === currentName) return

    updateNameMutation.mutate(
      { sheetId, name },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const handleDelete = () => {
    deleteWorkBoardMutation.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false)
        navigate('/work-boards')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Cài đặt bảng
          </DialogTitle>
          <DialogDescription>
            Quản lý thông tin và cài đặt cho bảng công việc này.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Rename Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên bảng công việc
            </Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên bảng..."
                className="flex-1"
              />
              <Button
                onClick={handleUpdateName}
                disabled={!name?.trim() || name === currentName || updateNameMutation.isPending}
              >
                {updateNameMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Lưu</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delete Section */}
          <div className="space-y-3">
            <div className="rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-400 mb-1">
                    Xóa bảng công việc
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300/80">
                    Hành động này sẽ xóa vĩnh viễn bảng và tất cả dữ liệu bên trong. Không thể hoàn
                    tác.
                  </p>
                </div>
                {!showDeleteConfirm && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa bảng
                  </Button>
                )}
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Alert
                    variant="destructive"
                    className="bg-white dark:bg-slate-950 border-red-200 dark:border-red-900"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Bạn có chắc chắn muốn xóa?</AlertTitle>
                    <AlertDescription>
                      Hành động này không thể hoàn tác. Bảng <strong>{currentName}</strong> sẽ bị
                      xóa vĩnh viễn.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteWorkBoardMutation.isPending}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteWorkBoardMutation.isPending}
                    >
                      {deleteWorkBoardMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Xác nhận xóa
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
