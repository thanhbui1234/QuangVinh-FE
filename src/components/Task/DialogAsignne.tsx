import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { useUpdateTask } from '@/hooks/assignments/task/useUpdateTask'

export function DialogAssignee({ memberTask, task }: { memberTask: any; task: any }) {
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(() => {
    // If task has assignees, use their IDs as default
    return task.assignees?.map((a: any) => String(a.id)) || []
  })
  const [open, setOpen] = useState(false)
  const { updateTaskMutation } = useUpdateTask()

  const handleAssignTask = () => {
    if (selectedAssignees.length === 0) {
      return
    }

    const assigneesPayload = selectedAssignees.map((id) => ({ id: Number(id) }))

    updateTaskMutation.mutate(
      {
        taskId: task.taskId,
        groupId: task.groupId,
        assignees: assigneesPayload,
      },
      {
        onSuccess: () => {
          setOpen(false)
          // Reset to current assignees after successful update
          setSelectedAssignees(task.assignees?.map((a: any) => String(a.id)) || [])
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 bg-gray-200">
          Giao việc
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Giao việc</DialogTitle>
          <DialogDescription>
            Chọn người để giao việc này (có thể chọn nhiều người)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="assignees">Người thực hiện</Label>
            <MultiSelect
              options={
                memberTask?.map((member: any) => ({
                  label: member.name || member.email,
                  value: String(member.id),
                })) || []
              }
              selected={selectedAssignees}
              onChange={setSelectedAssignees}
              placeholder="Chọn người thực hiện..."
              emptyText="Không tìm thấy thành viên"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAssignTask}
            disabled={
              selectedAssignees.length === 0 || updateTaskMutation.isPending || task.status === 9
            }
          >
            {updateTaskMutation.isPending
              ? 'Đang giao...'
              : `${task.status === 9 ? 'Công việc đã hoàn thành' : 'Giao việc'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
