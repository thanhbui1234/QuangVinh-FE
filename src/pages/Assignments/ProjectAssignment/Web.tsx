import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AssignmentsSheet from '@/components/Assignments/Sheet'
import ProjectGrid from '@/components/Assignments/ProjectGrid'
import { useGetProjectList } from '@/hooks/assignments/useGetProjectList'
import { useCreateProject } from '@/hooks/assignments/useCreateProject'
import { useUpdateProject } from '@/hooks/assignments/useUpdateProject'
import type { IProject, IProjectAssignment } from '@/types/project'
import { useSearchProject } from '@/hooks/assignments/useSearchProject'
import { Link } from 'react-router'
import { DialogConfirm } from '@/components/ui/alertComponent'
import { useDeleteProject } from '@/hooks/assignments/useDeleteProject'
import { useUpdateStatus } from '@/hooks/assignments/useUpdateStatus'
import useCheckRole from '@/hooks/useCheckRole'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

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
  const { updateStatusMutation } = useUpdateStatus()
  const [open, setOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [editingProject, setEditingProject] = useState<IProjectAssignment | null>(null)
  const { createSearchMutation } = useSearchProject()
  const [searchResults, setSearchResults] = useState<IProjectAssignment[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<IProjectAssignment | null>(null)
  const { deleteProjectMutation } = useDeleteProject()
  const { hasPermission } = useCheckRole()
  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    if (searchValue.trim()) {
      createSearchMutation.mutate(searchValue, {
        onSuccess: (data) => {
          setSearchResults(data?.taskGroups || [])
          setShowSearchDropdown(true)
        },
      })
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, 0.25) // set

  useEffect(() => {
    debouncedSearch(search)
  }, [search])

  const handleSubmit = (data: IProject) => {
    if (editingProject) {
      const isStatusChanged = data.status !== editingProject.status
      const isOtherChanged =
        data.name !== editingProject.name || data.privacy !== editingProject.privacy

      if (isStatusChanged) {
        updateStatusMutation.mutate(
          {
            taskGroupId: editingProject.taskGroupId,
            newStatus: data.status,
          },
          {
            onSuccess: () => {
              if (!isOtherChanged) {
                setOpen(false)
                setEditingProject(null)
              }
            },
          }
        )
      }

      if (isOtherChanged) {
        updateProjectMutation.mutate(
          { ...data, taskGroupId: editingProject.taskGroupId },
          {
            onSuccess: () => {
              setOpen(false)
              setEditingProject(null)
            },
          }
        )
      }
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

  const handleDelete = (project: IProjectAssignment) => {
    setProjectToDelete(project)
    setOpenConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate({ taskGroupId: projectToDelete.taskGroupId, newStatus: 4 })
      setProjectToDelete(null)
    }
    setOpenConfirm(false)
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
      <PageBreadcrumb />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dự án</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search Input with Dropdown */}
          <div className="relative sm:w-64 w-full">
            <Input
              placeholder="Tìm kiếm dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              className="w-full"
            />

            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
                {createSearchMutation.isPending ? (
                  <div className="p-4 text-center text-muted-foreground">Đang tìm kiếm...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Không tìm thấy dự án</div>
                ) : (
                  <ul className="py-1">
                    {searchResults.map((project) => (
                      <li
                        key={project.taskGroupId}
                        onClick={() => {
                          setShowSearchDropdown(false)
                        }}
                        className="px-4 py-2 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <Link to={`/assignments/${project.taskGroupId}`}>
                          <p className="font-medium text-foreground">{project.name}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {showSearchDropdown && (
              <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)} />
            )}
          </div>
          {hasPermission && <Button onClick={handleCreate}>Tạo dự án</Button>}
          <AssignmentsSheet
            open={open}
            setOpen={setOpen}
            onSubmit={handleSubmit}
            isSubmitting={
              isFetching ||
              createProjectMutation.isPending ||
              updateProjectMutation.isPending ||
              updateStatusMutation.isPending
            }
            mode={editingProject ? 'edit' : 'create'}
            initialData={editingProject}
          />
        </div>
      </div>

      <ProjectGrid
        projects={projectsAssignments}
        loading={isFetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} variant="outline" disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}

      <DialogConfirm
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa dự án này?"
        description="Hành động này không thể hoàn tác."
      />
    </div>
  )
}

export default ProjectAssignment
