import { Navigate, type RouteObject } from 'react-router'
import { lazy } from 'react'

const DashboardWeb = lazy(() => import('@/pages/Dashboard/Web'))
const PersonnelList = lazy(() => import('@/pages/Personnel/PersonnelList'))
const PersonnelPositions = lazy(() => import('@/pages/Personnel/PersonnelPositions'))
const DocumentsWeb = lazy(() => import('@/pages/Documents/Web'))
const DocumentsMy = lazy(() => import('@/pages/Documents/DocumentsMy'))
const DocumentsShared = lazy(() => import('@/pages/Documents/DocumentsShared'))
const LeavesWeb = lazy(() => import('@/pages/Personnel/Leaves/Web'))
const LateArrivalWeb = lazy(() => import('@/pages/Personnel/LateArrival/Web'))
const AddMember = lazy(() =>
  import('@/pages/Personnel/AddMember').then((m) => ({ default: m.AddMember }))
)
const NotificationPage = lazy(() =>
  import('@/pages/Notification/index').then((m) => ({ default: m.NotificationPage }))
)

export const WebRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <DashboardWeb />,
  },

  {
    path: '/personnel/list',
    element: <PersonnelList />,
  },
  {
    path: '/personnel/leaves',
    element: <LeavesWeb />,
  },
  {
    path: '/personnel/late-arrival',
    element: <LateArrivalWeb />,
  },
  {
    path: '/personnel/positions',
    element: <PersonnelPositions />,
  },
  {
    path: '/documents',
    element: <DocumentsWeb />,
  },
  {
    path: '/documents/my',
    element: <DocumentsMy />,
  },
  {
    path: '/documents/shared',
    element: <DocumentsShared />,
  },
  {
    path: '/personnel/member',
    element: <AddMember />,
  },
  {
    path: '/notifications',
    element: <NotificationPage />,
  },
]
