import { type RouteObject, Navigate } from 'react-router'
import { DashboardMobile, PersonnelMobile, DocumentsMobile, LeavesMobile } from '@/pages'
import ProjectAssignment from '@/pages/Assignments/ProjectAssignment/Web'
import { AddMember } from '@/pages/Personnel/AddMember'

export const MobileRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/mobile/dashboard" replace />,
  },
  {
    path: 'dashboard',
    element: <DashboardMobile />,
  },
  {
    path: 'assignments',
    element: <ProjectAssignment />,
  },
  {
    path: 'personnel',
    element: <PersonnelMobile />,
  },
  {
    path: 'documents',
    element: <DocumentsMobile />,
  },
  {
    path: 'leaves',
    element: <LeavesMobile />,
  },
  {
    path: 'member',
    element: <AddMember />,
  },
  {
    path: 'notifications',
    element: <h1>Notifications</h1>,
  },
]
