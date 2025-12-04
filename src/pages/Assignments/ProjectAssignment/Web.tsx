import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AssignmentsSheet from '@/components/Assignments/Sheet'
import ProjectGrid from '@/components/Assignments/ProjectGrid'
import { useGetProjectList } from '@/hooks/assignments/useGetProjectList'
import { useCreateProject } from '@/hooks/assignments/useCreateProject'
import { useUpdateProject } from '@/hooks/assignments/useUpdateProject'
import type { IProject, IProjectAssignment } from '@/types/project'

const ProjectAssignment = () => {
  const [search, setSearch] = useState('')
  const limit = 9

  const { projectsAssignments, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetProjectList({
      statuses: null,
      ownerIds: [],
      limit,
    })

  const { createProjectMutation } = useCreateProject()
  const { updateProjectMutation } = useUpdateProject()
  const [open, setOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<IProjectAssignment | null>(null)

  const handleSubmit = (data: IProject) => {
    if (editingProject) {
      updateProjectMutation.mutate(
        { ...data, taskGroupId: editingProject.taskGroupId },
        {
          onSuccess: () => {
            setOpen(false)
            setEditingProject(null)
          },
        }
      )
    } else {
      createProjectMutation.mutate(data, {
        onSuccess: () => {
          setOpen(false)
        },
      })
    }
  }

  const handleEdit = (project: IProjectAssignment) => {
    setEditingProject(project)
    setOpen(true)
  }

  const handleCreate = () => {
    setEditingProject(null)
    setOpen(true)
  }

  const handleLoadMore = () => {
    fetchNextPage()
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dự án</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Button onClick={handleCreate}>Tạo dự án</Button>
          <AssignmentsSheet
            open={open}
            setOpen={setOpen}
            onSubmit={handleSubmit}
            isSubmitting={
              isFetching || createProjectMutation.isPending || updateProjectMutation.isPending
            }
            mode={editingProject ? 'edit' : 'create'}
            initialData={editingProject}
          />
        </div>
      </div>

      <ProjectGrid projects={projectsAssignments} loading={isFetching} onEdit={handleEdit} />

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} variant="outline" disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProjectAssignment
