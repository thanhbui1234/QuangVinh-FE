import { Card, CardContent, CardHeader } from '../ui/card'
import type { IProjectAssignment } from '@/types/project'
import { ProjectCard } from './ProjectCard'

interface ProjectGridProps {
  projects: IProjectAssignment[]
  loading?: boolean
  onView?: (project: IProjectAssignment) => void
  onEdit?: (project: IProjectAssignment) => void
  onDelete?: (project: IProjectAssignment) => void
}

export const ProjectGrid = ({ projects, loading, onView, onEdit, onDelete }: ProjectGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (projects?.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-2xl text-muted-foreground">Không có dự án</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.map((p, idx) => (
        <ProjectCard
          key={p.taskGroupId || p.name || idx}
          project={p}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default ProjectGrid
