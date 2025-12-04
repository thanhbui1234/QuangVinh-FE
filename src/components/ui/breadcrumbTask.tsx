import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const BreadcrumbTask = ({ projectAssignmentDetail }: { projectAssignmentDetail: any }) => {
  return (
    <Breadcrumb className="px-6 pt-4 pb-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to={`/assignments/${projectAssignmentDetail?.groupId}`}
              className="text-gray-600 hover:text-gray-900 transition-colors hover:underline cursor-pointer"
            >
              {`Project-${projectAssignmentDetail?.groupId}`}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span className="text-gray-400">/</span>
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink className="text-blue-600 font-medium hover:underline cursor-pointer">
            {`Task-${projectAssignmentDetail?.taskId}`}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
