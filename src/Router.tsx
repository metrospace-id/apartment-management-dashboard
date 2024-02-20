import { lazy } from 'react'
import {
  createBrowserRouter,
} from 'react-router-dom'

const Login = lazy(() => import('pages/Login'))
const Home = lazy(() => import('pages/Home'))
const User = lazy(() => import('pages/User'))
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
    path: '/user',
    Component: User,
  },
  {
    path: '*',
    Component: Error404,
  },
])

export default router
