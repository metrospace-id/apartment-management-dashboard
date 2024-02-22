import { lazy } from 'react'
import {
  createBrowserRouter,
} from 'react-router-dom'

const Login = lazy(() => import('pages/Login'))
const Home = lazy(() => import('pages/Home'))
const Permission = lazy(() => import('pages/Permission'))
const Role = lazy(() => import('pages/Role'))
const User = lazy(() => import('pages/User'))
const Calendar = lazy(() => import('pages/Calendar'))
const Error404 = lazy(() => import('pages/Error/404'))

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/permission',
    Component: Permission,
  },
  {
    path: '/role',
    Component: Role,
  },
  {
    path: '/user',
    Component: User,
  },
  {
    path: '/calendar',
    Component: Calendar,
  },
  {
    path: '*',
    Component: Error404,
  },
])

export default router
