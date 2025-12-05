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
import { TASK_STATUS } from '@/constants/assignments/task'
import AssignmentsAction from '@/components/Assignments/AssignmentsAction'

export type User = {
  id: string
  name: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'pending' | 'cancel'

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: number
  taskType: number
  assigneeId?: string
  estimateHours?: number
}

export type Project = {
  id: string
  name: string
  description?: string
  tasks: Task[]
  members: string[] // user ids
}

// Map API task status number to TaskStatus
function mapTaskStatus(statusCode: number): TaskStatus {
  switch (statusCode) {
    case TASK_STATUS.CREATED:
    case TASK_STATUS.VISIBLE:
      return 'todo'
    case TASK_STATUS.PENDING:
      return 'pending'
    case TASK_STATUS.IN_PROGRESS:
      return 'in_progress'
    case TASK_STATUS.COMPLETED:
      return 'done'
    default:
      return 'todo'
  }
}

export const ProjectAssignmentDetail: React.FC = () => {
  const { id } = useParams()
  const { projectAssignmentDetail, isFetching } = useGetDetailProject(Number(id))
  const isMobile = useIsMobile()

  const { memberTask } = useGetMemberTask(Number(id))
  const createTaskMutation = useCreateTask()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

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
          estimateHours: task.estimateTime
            ? Math.round((task.estimateTime - Date.now()) / (1000 * 60 * 60))
            : undefined,
        })) || [],
    }
  }, [projectAssignmentDetail])

  // Transform members to User format
  const users: User[] = useMemo(() => {
    if (!projectAssignmentDetail?.members) return []
    return projectAssignmentDetail.members.map((member: any) => ({
      id: String(member.id),
      name: member.name || member.email,
    }))
  }, [projectAssignmentDetail])

  function handleCreateTask(data: CreateTaskFormData) {
    createTaskMutation.mutate(
      {
        description: data.description,
        priority: data.priority,
        taskType: data.taskType,
        groupId: Number(id),
        estimateTime: data.estimateTime,
        imageUrls: data.imageUrls,
        checkList: data.checkList,
        assigneeId: data.assigneeId,
        status: data.status,
        startTime: data.startTime,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false)
        },
      }
    )
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
      <AssignmentsAction
        project={project}
        projectAssignmentDetail={projectAssignmentDetail}
        setIsInviteOpen={setIsInviteOpen}
        setIsCreateOpen={setIsCreateOpen}
      />

      {/* Stats Section */}
      <Overview tasks={project.tasks} />

      {isMobile ? (
        <TaskList tasks={project.tasks} assignees={users} />
      ) : (
        <TaskTable tasks={project.tasks} assignees={users} />
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
        existingMemberIds={memberTask?.map((m: IMemberTask) => String(m.id)) || []}
      />
    </div>
  )
}

export default ProjectAssignmentDetail
