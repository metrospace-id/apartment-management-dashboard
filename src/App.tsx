import { Suspense } from 'react'
import {
  RouterProvider,
} from 'react-router-dom'
import id from 'dayjs/locale/id'
import dayjs from 'dayjs'

import router from 'Router'

dayjs.locale(id)

function App() {
  return (
    <Suspense fallback={<div />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
