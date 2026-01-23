import { type RouteObject, Navigate } from 'react-router'
import { lazy } from 'react'

const DashboardMobile = lazy(() => import('@/pages/Dashboard/Mobile'))
const PersonnelMobile = lazy(() => import('@/pages/Personnel/Mobile'))
const ProjectAssignment = lazy(() => import('@/pages/Assignments/ProjectAssignment/Web'))
const AddMember = lazy(() =>
  import('@/pages/Personnel/AddMember').then((m) => ({ default: m.AddMember }))
)
const NotificationPage = lazy(() =>
  import('@/pages/Notification/index').then((m) => ({ default: m.NotificationPage }))
)
const ScheduleMobile = lazy(() => import('@/pages/Personnel/Schedule/Mobile'))

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
