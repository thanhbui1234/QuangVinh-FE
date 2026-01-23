import { createBrowserRouter, Navigate } from 'react-router'
import { lazy, Suspense } from 'react'
import DeviceRouter from './DeviceRouter/DeviceRouter'
import PrivateRoute from './RoleRoute/PrivateRoute'
import PublichRoute from './RoleRoute/PublichRoute'
import PageLoader from '@/components/common/PageLoader'

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const MainLayout = lazy(() => import('@/layouts/MainLayout'))
const MobileLayout = lazy(() => import('@/layouts/MobileLayout'))
const Login = lazy(() => import('@/pages/Auth/Login'))
const Profile = lazy(() => import('@/pages/Profile/index').then((m) => ({ default: m.Profile })))
const ResponsiveLayout = lazy(() => import('@/layouts/ResponsiveLayout'))
const ProjectAssignmentDetail = lazy(() =>
  import('@/pages/Assignments/DetailProject/ProjectAssigmentDetail').then((m) => ({
    default: m.ProjectAssignmentDetail,
  }))
)
const ProjectAssignment = lazy(() => import('@/pages/Assignments/ProjectAssignment/Web'))
const DetailTask = lazy(() =>
  import('@/pages/Assignments/DetailTask/DetailTask').then((m) => ({ default: m.DetailTask }))
)
const WorkBoardDetail = lazy(() =>
  import('@/pages/Assignments/WorkBoards/WorkBoardDetail').then((m) => ({
    default: m.WorkBoardDetail,
  }))
)
const WorkBoardsList = lazy(() =>
  import('@/pages/Assignments/WorkBoards/WorkBoardsList').then((m) => ({
    default: m.WorkBoardsList,
  }))
)
const FilterWorkboard = lazy(() =>
  import('@/pages/Assignments/FilerWorkboard/index').then((m) => ({ default: m.FilterWorkboard }))
)
const CollectionDetail = lazy(() =>
  import('@/pages/Assignments/CollectionDetail/index').then((m) => ({
    default: m.CollectionDetail,
  }))
)

import { WebRoutes } from './DeviceRouter/WebRoute'
import { MobileRoutes } from './DeviceRouter/MobileRoute'

const SuspenseLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <DeviceRouter
        children={
          <PrivateRoute
            children={
              <SuspenseLayout>
                <MainLayout />
              </SuspenseLayout>
            }
          />
        }
      />
    ),
    children: WebRoutes,
  },
  {
    path: '/mobile',
    element: (
      <DeviceRouter
        children={
          <PrivateRoute
            children={
              <SuspenseLayout>
                <MobileLayout />
              </SuspenseLayout>
            }
          />
        }
      />
    ),
    children: MobileRoutes,
  },
  {
    path: '/assignments',
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
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
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
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
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
    children: [
      {
        index: true,
        element: <DetailTask />,
      },
    ],
  },
  {
    element: (
      <PublichRoute
        children={
          <SuspenseLayout>
            <AuthLayout />
          </SuspenseLayout>
        }
      />
    ),
    path: '/login',
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
  {
    path: '/profile/:id',
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
  },
  {
    path: '/filter/work-boards',
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
    children: [
      {
        index: true,
        element: <FilterWorkboard />,
      },
    ],
  },
  {
    path: '/collection/:id',
    element: (
      <PrivateRoute
        children={
          <SuspenseLayout>
            <ResponsiveLayout />
          </SuspenseLayout>
        }
      />
    ),
    children: [
      {
        index: true,
        element: <CollectionDetail />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
