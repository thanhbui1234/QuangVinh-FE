import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import CreateTaskModal, { type CreateTaskFormData } from '@/components/Assignments/CreateTaskModal'
import TaskTable from '@/components/Assignments/ProjectDetailTable/TaskTable'
import TaskList from '@/components/Assignments/ProjectDetailTable/TaskList'
import { useIsMobile } from '@/hooks/use-mobile'
import InviteMemberModal from '@/components/Assignments/InviteMemberModal'
import { Overview } from '@/components/Assignments/overview'
import { useGetDetailProject } from '@/hooks/assignments/useGetDetailProject'
import { useGetMemberTask, type IMemberTask } from '@/hooks/assignments/useGetMemberTask'
import { useCreateTask } from '@/hooks/assignments/task/useCreateTask'
import { useCreateTaskTemplate } from '@/hooks/assignments/task/useCreateDailyTask'
import AssignmentsAction from '@/components/Assignments/AssignmentsAction'
import { mapTaskStatus, type TaskStatus } from '@/utils/getLable'
import { DialogConfirm } from '@/components/ui/alertComponent'
import { useDeleteTask } from '@/hooks/assignments/task/useDeleteTask'
import useCheckRole from '@/hooks/useCheckRole'
import SonnerToaster from '@/components/ui/toaster'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import AssignmentsModal from '@/components/Assignments/AssignmentsModal'
import { useUpdateProject } from '@/hooks/assignments/useUpdateProject'
import { useUpdateStatus } from '@/hooks/assignments/useUpdateStatus'
import type { IProject } from '@/types/project'

export type User = {
  id: string
  name: string
}

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: number
  taskType: number
  assigneeId?: string
  supervisorId?: string
  supervisor?: {
    id: number
    name: string
    email?: string
    avatar?: string
  }
  estimateHours?: number
}

export type Project = {
  id: string
  name: string
  description?: string
  tasks: Task[]
  members: string[] // user ids
}

export const ProjectAssignmentDetail: React.FC = () => {
  const { id } = useParams()
  const { projectAssignmentDetail, isFetching } = useGetDetailProject(Number(id))
  const isMobile = useIsMobile()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const deleteTaskMutation = useDeleteTask(Number(id))
  const { memberTask } = useGetMemberTask(Number(id))
  const createTaskMutation = useCreateTask()
  const createTaskTemplateMutation = useCreateTaskTemplate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { hasPermission } = useCheckRole()

  const { updateProjectMutation } = useUpdateProject()
  const { updateStatusMutation } = useUpdateStatus()

  const supervisors = useMemo(() => {
    return projectAssignmentDetail?.tasks?.map((task: any) => ({
      id: task?.supervisor?.id,
      name: task?.supervisor?.name,
    }))
  }, [projectAssignmentDetail?.tasks])
  // Transform API response to Project format
  const project: Project | null = useMemo(() => {
    if (!projectAssignmentDetail) return null

    return {
      id: String(projectAssignmentDetail.taskGroupId),
      name: projectAssignmentDetail.name,
      description: '',
      members: projectAssignmentDetail.memberIds?.map(String) || [],
      tasks:
        projectAssignmentDetail.tasks?.map((task: any) => ({
          id: String(task.taskId),
          title: task.description,
          description: task.checkList || undefined,
          status: mapTaskStatus(task.status),
          priority: task.priority,
          taskType: task.taskType,
          assigneeId: task.assignee?.id ? String(task.assignee.id) : undefined,
          supervisorId: task.supervisor?.id ? String(task.supervisor.id) : undefined,
          supervisor: task.supervisor || undefined,
          estimateHours: task.estimateTime
            ? Math.round((task.estimateTime - Date.now()) / (1000 * 60 * 60) / 3)
            : undefined,
        })) || [],
    }
  }, [projectAssignmentDetail])

  // Transform members to User format (currently not used but kept for future reference)
  /* const users: User[] = useMemo(() => {
    if (!projectAssignmentDetail?.members) return []
    return projectAssignmentDetail.members.map((member: any) => ({
      id: String(member.id),
      name: member.name || member.email,
    }))
  }, [projectAssignmentDetail]) */

  function handleCreateTask(data: CreateTaskFormData) {
    // Base payload
    const basePayload = {
      description: data.description,
      priority: data.priority,
      taskType: data.taskType,
      groupId: Number(id),
      estimateTime: data.estimateTime,
      imageUrls: data.imageUrls,
      checkList: data.checkList,
      assigneeIds: data.assigneeIds,
      supervisorId: data.supervisorId,
      status: data.status,
      startTime: data.startTime,
    }

    // If recurrence is enabled, create task template
    if (data.isRecurrenceEnabled) {
      createTaskTemplateMutation.mutate(
        {
          ...basePayload,
          isRecurrenceEnabled: true,
          recurrenceType: data.recurrenceType,
          recurrenceInterval: data.recurrenceInterval,
          hourOfDay: data.hourOfDay,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
        },
        {
          onSuccess: () => {
            setIsCreateOpen(false)
          },
        }
      )
    } else {
      // Create regular task
      createTaskMutation.mutate(basePayload, {
        onSuccess: () => {
          setIsCreateOpen(false)
        },
      })
    }
  }

  const handleUpdateProject = (data: IProject) => {
    if (!projectAssignmentDetail) return

    const isStatusChanged = data.status !== projectAssignmentDetail.status
    const isOtherChanged =
      data.name !== projectAssignmentDetail.name || data.privacy !== projectAssignmentDetail.privacy

    if (isStatusChanged) {
      updateStatusMutation.mutate(
        {
          taskGroupId: projectAssignmentDetail.taskGroupId,
          newStatus: data.status,
        },
        {
          onSuccess: () => {
            if (!isOtherChanged) {
              setIsEditOpen(false)
            }
          },
        }
      )
    }

    if (isOtherChanged) {
      updateProjectMutation.mutate(
        { ...data, taskGroupId: projectAssignmentDetail.taskGroupId },
        {
          onSuccess: () => {
            setIsEditOpen(false)
          },
        }
      )
    }
  }

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      if (!hasPermission) {
        SonnerToaster({
          type: 'error',
          message: 'Bạn không có quyền xóa',
        })
        return
      }
      deleteTaskMutation.mutate(Number(taskToDelete))
      setOpenConfirm(false)
      setTaskToDelete(null)
    }
  }

  const handleTaskDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId)
    setOpenConfirm(true)
  }
  // Loading fallback
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải chi tiết dự án...</p>
        </div>
      </div>
    )
  }

  // No data fallback
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Không tìm thấy dự án</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4 flex flex-col gap-4">
      <PageBreadcrumb />
      <AssignmentsAction
        project={project}
        projectAssignmentDetail={projectAssignmentDetail}
        setIsInviteOpen={setIsInviteOpen}
        setIsCreateOpen={setIsCreateOpen}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Stats Section */}
      <Overview tasks={project.tasks} />

      {isMobile ? (
        <TaskList
          tasks={project.tasks}
          supervisors={supervisors}
          onDelete={handleTaskDeleteClick}
        />
      ) : (
        <TaskTable
          tasks={project.tasks}
          supervisors={supervisors}
          onDelete={handleTaskDeleteClick}
        />
      )}

      <CreateTaskModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        memberTask={memberTask || []}
        onCreate={handleCreateTask}
        groupId={Number(id)}
      />

      <InviteMemberModal
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        taskGroupId={Number(id)}
        existingMemberEmails={
          memberTask
            ?.map((m: IMemberTask) => m.email)
            .filter((email): email is string => !!email) || []
        }
      />

      <AssignmentsModal
        open={isEditOpen}
        setOpen={setIsEditOpen}
        onSubmit={handleUpdateProject}
        isSubmitting={updateProjectMutation.isPending || updateStatusMutation.isPending}
        mode="edit"
        initialData={projectAssignmentDetail}
      />

      <DialogConfirm
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa công việc này?"
        description="Hành động này không thể hoàn tác."
      />
    </div>
  )
}

export default ProjectAssignmentDetail
