import { createBrowserRouter, Navigate } from 'react-router'
import DeviceRouter from './DeviceRouter/DeviceRouter'
import PrivateRoute from './RoleRoute/PrivateRoute'
import PublichRoute from './RoleRoute/PublichRoute'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import MobileLayout from '@/layouts/MobileLayout'
import { Login, Profile, Register } from '@/pages'
import ResponsiveLayout from '@/layouts/ResponsiveLayout'
import { WebRoutes } from './DeviceRouter/WebRoute'
import { MobileRoutes } from './DeviceRouter/MobileRoute'
import { ProjectAssignmentDetail } from '@/pages/Assignments/DetailProject/ProjectAssigmentDetail'
import ProjectAssignment from '@/pages/Assignments/ProjectAssignment/Web'
import { DetailTask } from '@/pages/Assignments/DetailTask/DetailTask'
import { WorkBoardDetail } from '@/pages/Assignments/WorkBoards/WorkBoardDetail'
import { WorkBoardsList } from '@/pages/Assignments/WorkBoards/WorkBoardsList'
const router = createBrowserRouter([
  {
    path: '/',
    element: <DeviceRouter children={<PrivateRoute children={<MainLayout />} />} />,
    children: WebRoutes,
  },
  {
    path: '/mobile',
    element: <DeviceRouter children={<PrivateRoute children={<MobileLayout />} />} />,
    children: MobileRoutes,
  },
  {
    path: '/assignments',
    element: <PrivateRoute children={<ResponsiveLayout />} />,
    children: [
      {
        index: true,
        element: <ProjectAssignment />,
      },
      {
        path: ':id',
        element: <ProjectAssignmentDetail />,
      },
    ],
  },
  {
    path: '/work-boards',
    element: <PrivateRoute children={<ResponsiveLayout />} />,
    children: [
      {
        index: true,
        element: <WorkBoardsList />,
      },
      {
        path: ':id',
        element: <WorkBoardDetail />,
      },
    ],
  },
  {
    path: '/tasks/:id',
    element: <PrivateRoute children={<ResponsiveLayout />} />,
    children: [
      {
        index: true,
        element: <DetailTask />,
      },
    ],
  },
  {
    element: <PublichRoute children={<AuthLayout />} />,
    path: '/login',
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    element: <PublichRoute children={<AuthLayout />} />,
    path: '/register',
    children: [
      {
        index: true,
        element: <Register />,
      },
    ],
  },
  {
    path: '/profile',
    element: <PrivateRoute children={<ResponsiveLayout />} />,
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
  {
    path: '/profile/:id',
    element: <PrivateRoute children={<ResponsiveLayout />} />,
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
