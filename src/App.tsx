import { Suspense } from 'react'
import {
  RouterProvider,
} from 'react-router-dom'

import router from 'Router'

function App() {
  return (
    <Suspense fallback={<div />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
