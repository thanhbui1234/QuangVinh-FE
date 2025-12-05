import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import type { IProjectAssignment } from '@/types/project'
import { useNavigate } from 'react-router'
import { Users, CheckCircle2, User, MoreVertical, Pencil } from 'lucide-react'
import { PRIVACY_LABEL } from '@/constants/assignments/privacy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface ProjectCardProps {
  project: IProjectAssignment
  onView?: (project: IProjectAssignment) => void
  onEdit?: (project: IProjectAssignment) => void
}

const getPrivacy = (privacy: number) => {
  switch (privacy) {
    case 1:
      return PRIVACY_LABEL.PUBLIC
    default:
      return PRIVACY_LABEL.PRIVATE
  }
}

export const ProjectCard = ({ project, onEdit }: ProjectCardProps) => {
  const navigate = useNavigate()

  const handleView = () => {
    navigate(`/assignments/${project.taskGroupId}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(project)
  }

  return (
    <Card onClick={handleView} className="group relative cursor-pointer">
      {/* Badge và Dropdown ở góc phải trên */}
      <div className="absolute top-3 right-0 flex items-center gap-2 z-10">
        <Badge variant="secondary">{getPrivacy(project.privacy)}</Badge>
        {onEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <CardHeader className="pr-32">
        {/* Title - tối đa 2 dòng với ellipsis */}
        <CardTitle className="line-clamp-2 break-words">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {/* Owner */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Người tạo</span>
            <span className="font-medium">{project.owner?.name || '—'}</span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Thành viên:</span>
            <span className="font-medium">{project.memberIds?.length || 0} người</span>
          </div>

          {/* Tasks */}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Số task:</span>
            <span className="font-medium">{project.taskIds?.length || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard
