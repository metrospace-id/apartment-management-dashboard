import {
  createBrowserRouter,
} from 'react-router-dom'

import PageLogin from 'pages/Login'
import PageHome from 'pages/Home'
import PagePermission from 'pages/Permission'
import PageRole from 'pages/Role'
import PageUser from 'pages/User'
import PageUnitApartment from 'pages/Unit/Apartment'
import PageUnitCafe from 'pages/Unit/Cafe'
import PageCalendar from 'pages/Calendar'
import PageError404 from 'pages/Error/404'

const router = createBrowserRouter([
  {
    path: '/',
    Component: PageHome,
  },
  {
    path: '/login',
    Component: PageLogin,
  },
  {
    path: '/permission',
    Component: PagePermission,
  },
  {
    path: '/role',
    Component: PageRole,
  },
  {
    path: '/user',
    Component: PageUser,
  },
  {
    path: '/unit/apartment',
    Component: PageUnitApartment,
  },
  {
    path: '/unit/cafe',
    Component: PageUnitCafe,
  },
  {
    path: '/calendar',
    Component: PageCalendar,
  },
  {
    path: '*',
    Component: PageError404,
  },
])

export default router
