import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import type { IProjectAssignment } from '@/types/project'
import { useNavigate } from 'react-router'
import { MoreVertical, Pencil, Trash, Clock, CheckCircle2, Circle, Users } from 'lucide-react'
import { PRIVACY_LABEL, STATUS_PROJECT } from '@/constants/assignments/privacy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { usePermission } from '@/hooks/useCheckPermission'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { formatTimestampToDate } from '@/utils/CommonUtils'

interface ProjectCardProps {
  project: IProjectAssignment
  onView?: (project: IProjectAssignment) => void
  onEdit?: (project: IProjectAssignment) => void
  onDelete?: (project: IProjectAssignment) => void
}

const getPrivacy = (privacy: number) => {
  switch (privacy) {
    case 1:
      return { label: PRIVACY_LABEL.PUBLIC, color: 'bg-blue-50 text-blue-600 border-blue-100' }
    default:
      return { label: PRIVACY_LABEL.PRIVATE, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  }
}

const getStatus = (status: number) => {
  switch (status) {
    case STATUS_PROJECT.CREATED:
      return { label: 'Mới tạo', color: 'text-gray-600', bg: 'bg-gray-50' }

    case STATUS_PROJECT.IN_PROGRESS:
      return { label: 'Đang thực hiện', color: 'text-blue-600', bg: 'bg-blue-50' }
    case STATUS_PROJECT.COMPLETED:
      return { label: 'Đã hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    default:
      return { label: 'Mới tạo', color: 'text-gray-600', bg: 'bg-gray-50' }
  }
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate()
  const privacy = getPrivacy(project.privacy)
  const status = getStatus(project.status)

  const handleView = () => {
    navigate(`/assignments/${project.taskGroupId}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(project)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(project)
  }

  const canDelete = usePermission({ ownerId: project.owner.id, allowDirector: true })

  // Calculate progress
  const totalTasks = project.taskCount || 0
  const completedTasks = project.completedTaskCount || 0
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
      onClick={handleView}
    >
      <Card className="group relative h-full cursor-pointer border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
        {/* Accent Bar at top */}
        <CardContent className="p-5">
          {/* Top Row: Privacy & Actions */}
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline" className={cn('font-medium border', privacy.color)}>
              {privacy.label}
            </Badge>

            {onEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Project Title */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[3rem]">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-muted-foreground font-medium">
                {project.memberIds?.length || 0} thành viên
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between items-end text-xs mb-1">
              <span className="font-medium text-gray-700">Tiến độ công việc</span>
              <span className="text-muted-foreground">
                <span className="text-blue-600 font-semibold">{completedTasks}</span>/{totalTasks}{' '}
                Hoàn thành
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Giờ làm</span>
                <span className="text-xs font-bold text-gray-700">
                  {project.workingHours || 0}h
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', status.bg)}>
                <CheckCircle2 className={cn('w-4 h-4', status.color)} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  Trạng thái
                </span>
                <span className={cn('text-xs font-bold', status.color)}>{status.label}</span>
              </div>
            </div>
          </div>

          {/* Small Footer */}
          <div className="mt-4 pt-3 flex justify-between items-center text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <Circle className="w-2 h-2 fill-gray-300 stroke-none" />
              <span>Cập nhật: {formatTimestampToDate(project.updatedTime)}</span>
            </div>
            <div className="font-medium">By {project.owner?.name}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProjectCard
