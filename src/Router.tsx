import {
  createBrowserRouter,
} from 'react-router-dom'

import Home from 'pages/Home'
import Error404 from 'pages/Error/404'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: 'about',
    element: <div>About</div>,
  },
  {
    path: '*',
    Component: Error404,
  },
])

export default router
