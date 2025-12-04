import { Navigate, type RouteObject } from 'react-router'
import {
  DashboardWeb,
  DocumentsWeb,
  PersonnelList,
  PersonnelPositions,
  DocumentsMy,
  DocumentsShared,
  LeavesWeb,
} from '@/pages'

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
]
