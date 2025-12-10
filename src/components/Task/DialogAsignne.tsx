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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAssigneTask } from '@/hooks/assignments/task/useAssigneTask'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function DialogAssignee({ memberTask, task }: { memberTask: any; task: any }) {
  const [selectedAssignee, setSelectedAssignee] = useState<string>(() => {
    // If task has an assignee, use their ID as default
    return task.assignee?.id ? String(task.assignee.id) : ''
  })
  const [open, setOpen] = useState(false)
  const assigneTaskMutation = useAssigneTask(task)

  const handleAssignTask = () => {
    if (!selectedAssignee) {
      return
    }
    assigneTaskMutation.mutate(Number(selectedAssignee), {
      onSuccess: () => {
        setOpen(false)
        // Reset to current assignee after successful update
        setSelectedAssignee(task.assignee?.id ? String(task.assignee.id) : '')
      },
    })
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
          <DialogDescription>Chọn người để giao việc này</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="assignee">Người thực hiện</Label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người thực hiện..." />
              </SelectTrigger>
              <SelectContent>
                {memberTask?.map((member: any) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled={!selectedAssignee || assigneTaskMutation.isPending || task.status === 9}
          >
            {assigneTaskMutation.isPending
              ? 'Đang giao...'
              : `${task.status === 9 ? 'Công việc đã hoàn thành ' : 'Giao việc'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
