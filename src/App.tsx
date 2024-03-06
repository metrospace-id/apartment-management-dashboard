import {
  RouterProvider,
} from 'react-router-dom'
import id from 'dayjs/locale/id'
import dayjs from 'dayjs'

import router from 'Router'

dayjs.locale(id)

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
