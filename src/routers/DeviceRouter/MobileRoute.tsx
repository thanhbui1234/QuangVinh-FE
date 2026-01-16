import { type RouteObject, Navigate } from 'react-router'
import { DashboardMobile, PersonnelMobile } from '@/pages'
import ProjectAssignment from '@/pages/Assignments/ProjectAssignment/Web'
import { AddMember } from '@/pages/Personnel/AddMember'
import { NotificationPage } from '@/pages/Notification'
import ScheduleMobile from '@/pages/Personnel/Schedule/Mobile'

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
    path: 'schedule',
    element: <ScheduleMobile />,
  },
  {
    path: 'leaves',
    element: <Navigate to="/mobile/schedule?tab=leaves" replace />,
  },
  {
    path: 'late-arrival',
    element: <Navigate to="/mobile/schedule?tab=late-arrival" replace />,
  },
  {
    path: 'member',
    element: <AddMember />,
  },
  {
    path: 'notifications',
    element: <NotificationPage />,
  },
]
